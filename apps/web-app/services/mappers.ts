import type {
  AvailabilityResponse,
  HoldItem,
  ISODate,
  ISODateTime,
  SlotRef,
  VenueConfig,
} from "@/types/booking";
import { isoToBusinessDate } from "@/lib/time-slots";
import { courtRateMinor } from "@/lib/pricing";

// ---------------------------------------------------------------------------
// Slot identities
// ---------------------------------------------------------------------------

export const slotKey = (slot: SlotRef): string => `${slot.courtId}|${slot.start}`;

export function parseSlotKey(key: string): { courtId: string; start: ISODateTime } {
  const sep = key.indexOf("|");
  return { courtId: key.slice(0, sep), start: key.slice(sep + 1) };
}

// ---------------------------------------------------------------------------
// Availability → slot-level view models
// ---------------------------------------------------------------------------

/** The set of slotKeys that are unavailable (booked/held/blocked) right now. */
export function buildUnavailableSlotKeys(resp: AvailabilityResponse | undefined): Set<string> {
  const set = new Set<string>();
  if (!resp) return set;
  for (const item of resp.unavailable) set.add(slotKey(item));
  return set;
}

// ---------------------------------------------------------------------------
// Selection → grouping view models
// ---------------------------------------------------------------------------

export function countSelectionByDate(slots: SlotRef[], timeZone: string): Record<ISODate, number> {
  const counts: Record<string, number> = {};
  for (const slot of slots) {
    const date = isoToBusinessDate(slot.start, timeZone);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return counts;
}

export function countSelectionByCourt(slots: SlotRef[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const slot of slots) counts[slot.courtId] = (counts[slot.courtId] ?? 0) + 1;
  return counts;
}

// ---------------------------------------------------------------------------
// Breakdown view model (grouped by date → court → merged consecutive runs)
// ---------------------------------------------------------------------------

export interface MergedLine {
  start: ISODateTime;
  end: ISODateTime;
  minutes: number;
  priceMinor: number;
  /** Original slot identities folded into this line (for removal). */
  slotKeys: string[];
}

export interface CourtGroup {
  courtId: string;
  courtName: string;
  lines: MergedLine[];
  subtotalMinor: number;
}

export interface DayGroup {
  date: ISODate;
  courts: CourtGroup[];
  subtotalMinor: number;
}

export interface BreakdownData {
  days: DayGroup[];
  totalMinor: number;
}

interface RawSlot extends SlotRef {
  courtName: string;
  hourlyRateMinor: number;
}

function mergeIntoBreakdown(slots: RawSlot[], venue: VenueConfig): BreakdownData {
  const tz = venue.timezone;
  const days = new Map<ISODate, Map<string, RawSlot[]>>();

  for (const slot of slots) {
    const date = isoToBusinessDate(slot.start, tz);
    if (!days.has(date)) days.set(date, new Map());
    const byCourt = days.get(date)!;
    if (!byCourt.has(slot.courtId)) byCourt.set(slot.courtId, []);
    byCourt.get(slot.courtId)!.push(slot);
  }

  const dayGroups: DayGroup[] = [];
  let totalMinor = 0;

  const dates = [...days.keys()].sort();
  for (const date of dates) {
    const byCourt = days.get(date)!;
    const courtGroups: CourtGroup[] = [];
    let daySubtotal = 0;
    for (const [courtId, courtSlots] of byCourt) {
      const sorted = [...courtSlots].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      const lines: MergedLine[] = [];
      let run: RawSlot[] = [];

      const flush = () => {
        if (run.length === 0) return;
        const start = run[0].start;
        const anchor = new Date(start).getTime();
        const end = new Date(anchor + run.length * venue.slotMinutes * 60_000).toISOString();
        const minutes = run.length * venue.slotMinutes;
        const priceMinor = courtRateMinor(
          { id: courtId, name: run[0].courtName, hourlyRateMinor: run[0].hourlyRateMinor },
          minutes
        );
        lines.push({
          start,
          end,
          minutes,
          priceMinor,
          slotKeys: run.map((s) => slotKey(s)),
        });
        run = [];
      };

      for (const slot of sorted) {
        const prev = run[run.length - 1];
        if (prev) {
          const prevEnd = new Date(prev.start).getTime() + venue.slotMinutes * 60_000;
          if (new Date(slot.start).getTime() - prevEnd <= 0) {
            run.push(slot);
            continue;
          }
          flush();
        }
        run = [slot];
      }
      flush();

      const subtotalMinor = lines.reduce((sum, l) => sum + l.priceMinor, 0);
      courtGroups.push({
        courtId,
        courtName: courtSlots[0].courtName,
        lines,
        subtotalMinor,
      });
      daySubtotal += subtotalMinor;
    }
    courtGroups.sort((a, b) => a.courtId.localeCompare(b.courtId));
    dayGroups.push({ date, courts: courtGroups, subtotalMinor: daySubtotal });
    totalMinor += daySubtotal;
  }

  return { days: dayGroups, totalMinor };
}

/** Client-side estimated breakdown from raw selection (display only). */
export function buildEstimatedBreakdown(
  slots: SlotRef[],
  venue: VenueConfig
): BreakdownData {
  const byId = new Map(venue.courts.map((c) => [c.id, c]));
  const raw: RawSlot[] = slots.map((s) => {
    const court = byId.get(s.courtId);
    return {
      ...s,
      courtName: court?.name ?? s.courtId,
      hourlyRateMinor: court?.hourlyRateMinor ?? 0,
    };
  });
  return mergeIntoBreakdown(raw, venue);
}

/** Authoritative server-confirmed breakdown from a hold response. */
export function buildServerBreakdown(items: HoldItem[], venue: VenueConfig): BreakdownData {
  const byId = new Map(venue.courts.map((c) => [c.id, c]));
  // Merge the held slot identities with per-slot server prices; the merged
  // line prices and totals are then recomputed from the server's exact prices.
  const priceByKey = new Map(items.map((i) => [`${i.courtId}|${i.start}`, i.priceMinor]));
  const raw: RawSlot[] = items.map((item) => ({
    courtId: item.courtId,
    courtName: byId.get(item.courtId)?.name ?? item.courtId,
    hourlyRateMinor: 0, // ignored for server breakdown; prices come from HoldItem
    start: item.start,
  }));

  const data = mergeIntoBreakdown(raw, venue);
  for (const day of data.days) {
    for (const court of day.courts) {
      for (const line of court.lines) {
        const serverMinor = line.slotKeys.reduce(
          (sum, k) => sum + (priceByKey.get(k) ?? 0),
          0
        );
        if (serverMinor > 0) line.priceMinor = serverMinor;
      }
      court.subtotalMinor = court.lines.reduce((s, l) => s + l.priceMinor, 0);
    }
    day.subtotalMinor = day.courts.reduce((s, c) => s + c.subtotalMinor, 0);
  }
  data.totalMinor = data.days.reduce((s, d) => s + d.subtotalMinor, 0);
  return data;
}
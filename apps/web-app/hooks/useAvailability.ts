"use client";

import { useCallback, useEffect } from "react";
import { uiConfig } from "@/services";
import { getQueryClient, useQuery, type UseQueryResult } from "@/lib/query";
import { addBusinessDays } from "@/lib/time-slots";
import { useBookingService } from "@/services/context";
import type { AvailabilityResponse, ISODate } from "@/types/booking";

const availabilityCacheKey = (weekStart: ISODate): string =>
  ["availability", weekStart].join("::");

/**
 * Fetch the entire visible week in ONE request (no per-cell/per-day requests),
 * cache per week, prefetch the next week, and refetch on focus + an interval
 * (uiConfig.availabilityRefetchMs). The data (including serverTime) is the
 * source of truth for "now" — components never read Date.now() for past-ness.
 */
export function useAvailability(weekStart: ISODate | null): UseQueryResult<AvailabilityResponse> {
  const service = useBookingService();

  const queryFn = useCallback(async (): Promise<AvailabilityResponse> => {
    if (!weekStart) throw new Error("No week selected");
    const to = addBusinessDays(weekStart, 6);
    return service.getAvailability(weekStart, to);
  }, [weekStart, service]);

  const query = useQuery<AvailabilityResponse>({
    queryKey: ["availability", weekStart ?? "none"],
    queryFn,
    enabled: weekStart !== null,
    refetchIntervalMs: weekStart ? uiConfig.availabilityRefetchMs : undefined,
    refetchOnWindowFocus: true,
  });

  // Prefetch the next week so arrow-navigation to the following week is instant.
  useEffect(() => {
    if (!weekStart) return;
    const client = getQueryClient();
    const nextStart = addBusinessDays(weekStart, 7);
    const nextTo = addBusinessDays(nextStart, 6);
    client.prefetch(availabilityCacheKey(nextStart), () =>
      service.getAvailability(nextStart, nextTo)
    );
  }, [weekStart, service]);

  return query;
}
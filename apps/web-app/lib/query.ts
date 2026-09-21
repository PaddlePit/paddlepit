import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

export type QueryKey = ReadonlyArray<string | number>;

export type QueryStatus = "pending" | "success" | "error";

export interface QuerySnapshot<T> {
  status: QueryStatus;
  data?: T;
  error?: unknown;
  isFetching: boolean;
  dataUpdatedAt?: number;
}

interface ActiveQuery {
  status: QueryStatus;
  data?: unknown;
  error?: unknown;
  isFetching: boolean;
  dataUpdatedAt?: number;
  lastErrorUpdatedAt?: number;
}

const EMPTY_SNAPSHOT: QuerySnapshot<never> = {
  status: "pending",
  isFetching: false,
};

function isEqual(a: ActiveQuery | undefined, b: ActiveQuery | undefined): boolean {
  return (
    a?.status === b?.status &&
    a?.data === b?.data &&
    a?.error === b?.error &&
    a?.isFetching === b?.isFetching &&
    a?.dataUpdatedAt === b?.dataUpdatedAt
  );
}

class TinyQueryClient {
  private cache = new Map<string, ActiveQuery>();
  private inflight = new Map<string, Promise<void>>();
  private subscribers = new Set<() => void>();

  /** Semantic serialization so ["availability","2026-08-03"] survives key order. */
  static serialize(key: QueryKey): string {
    return key.map((k) => (typeof k === "object" ? JSON.stringify(k) : String(k))).join("::");
  }

  subscribe = (listener: () => void): (() => void) => {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  };

  private notify() {
    for (const listener of this.subscribers) listener();
  }

  private commit(key: string, next: ActiveQuery) {
    const prev = this.cache.get(key);
    if (isEqual(prev, next)) return;
    this.cache.set(key, next);
    this.notify();
  }

  run<T>(key: string, queryFn: () => Promise<T>, keepPreviousData: boolean): void {
    const existing = this.cache.get(key);
    if (this.inflight.has(key)) return;
    this.commit(key, {
      status: existing?.data !== undefined ? existing?.status ?? "pending" : "pending",
      data: keepPreviousData ? existing?.data : undefined,
      error: keepPreviousData ? undefined : existing?.error,
      isFetching: true,
      dataUpdatedAt: existing?.dataUpdatedAt,
    });
    const promise = (async () => {
      try {
        const data = await queryFn();
        this.commit(key, { status: "success", data, isFetching: false, dataUpdatedAt: Date.now() });
      } catch (error) {
        const hadData = this.cache.get(key)?.data !== undefined;
        this.commit(key, {
          status: hadData ? "success" : "error",
          data: hadData ? this.cache.get(key)?.data : undefined,
          error,
          isFetching: false,
          dataUpdatedAt: hadData ? this.cache.get(key)?.dataUpdatedAt : undefined,
        });
      } finally {
        this.inflight.delete(key);
      }
    })();
    this.inflight.set(key, promise);
  }

  /** Fire-and-forget prefetch that populates the cache without subscribing. */
  prefetch<T>(key: string, queryFn: () => Promise<T>): void {
    this.run(key, queryFn, true);
  }

  read<T>(key: string): QuerySnapshot<T> {
    return (this.cache.get(key) as QuerySnapshot<T> | undefined) ?? EMPTY_SNAPSHOT;
  }
}

let sharedClient: TinyQueryClient;

export function getQueryClient(): TinyQueryClient {
  if (typeof window === "undefined") {
    // SSR/prerender: return the module-level instance so snapshots stay stable.
    return (globalThis as { __ppQueryClient?: TinyQueryClient }).__ppQueryClient ?? new TinyQueryClient();
  }
  const g = globalThis as { __ppQueryClient?: TinyQueryClient };
  if (!g.__ppQueryClient) g.__ppQueryClient = new TinyQueryClient();
  sharedClient = g.__ppQueryClient;
  return sharedClient;
}

export interface UseQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchIntervalMs?: number;
  refetchOnWindowFocus?: boolean;
}

export interface UseQueryResult<T> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  isRefetching: boolean;
  isFetching: boolean;
  error?: unknown;
  refetch: () => void;
}

const DEFAULT_REFETCH_ON_FOCUS = true;

export function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  refetchIntervalMs,
  refetchOnWindowFocus = DEFAULT_REFETCH_ON_FOCUS,
}: UseQueryOptions<T>): UseQueryResult<T> {
  const client = getQueryClient();
  const key = TinyQueryClient.serialize(queryKey);

  // `key` is the serialized primitive for the current render, so the snapshot
  // and every effect can read it directly — no ref indirection (which the React
  // purity rules forbid during render). NOTE: callers must memoize `queryFn`
  // (e.g. useCallback) so the effects below don't re-arm the interval on every
  // render; `useAvailability` does this against its query key.
  const snapshot = useSyncExternalStore(
    client.subscribe,
    () => client.read<T>(key),
    () => EMPTY_SNAPSHOT as QuerySnapshot<T>
  );

  // First-run / key-change fetch + optional refetch interval. When `queryFn`
  // identity changes without `key` changing, the interval is re-armed but no
  // refetch happens, so hot queryFn functions are safe.
  useEffect(() => {
    if (!enabled || !key) return;
    client.run<T>(key, queryFn, true);
    if (refetchIntervalMs && refetchIntervalMs > 0) {
      const interval = window.setInterval(
        () => client.run<T>(key, queryFn, true),
        refetchIntervalMs
      );
      return () => window.clearInterval(interval);
    }
    return undefined;
  }, [key, enabled, refetchIntervalMs, client, queryFn]);

  useEffect(() => {
    if (!enabled || !key || !refetchOnWindowFocus) return;
    const onFocus = () => client.run<T>(key, queryFn, true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [key, enabled, refetchOnWindowFocus, client, queryFn]);

  const refetch = () => client.run<T>(key, queryFn, true);
  return {
    data: snapshot.data as T | undefined,
    isLoading: snapshot.status === "pending" && !snapshot.data,
    isError: snapshot.status === "error",
    isRefetching: snapshot.isFetching && snapshot.data !== undefined,
    isFetching: snapshot.isFetching,
    error: snapshot.error,
    refetch,
  };
}

export interface UseMutationResult<TVars, TData> {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  mutate: (vars: TVars) => Promise<TData>;
}

export function useMutation<TVars, TData>(
  mutationFn: (vars: TVars) => Promise<TData>
): UseMutationResult<TVars, TData> {
  const [state, setState] = useState<{ isPending: boolean; error?: unknown }>({
    isPending: false,
  });
  const fnRef = useRef(mutationFn);
  useEffect(() => {
    fnRef.current = mutationFn;
  }, [mutationFn]);

  // mutate has a stable identity so it is safe to call from effect deps without
  // re-triggering a new mutation on every render.
  const mutate = useCallback((vars: TVars) => {
    setState({ isPending: true, error: undefined });
    return fnRef.current(vars).then(
      (data) => {
        setState({ isPending: false });
        return data;
      },
      (error) => {
        setState({ isPending: false, error });
        throw error;
      }
    );
  }, []);

  // Memoized result: identity only changes when pending/error state changes, so
  // hooks that list it in an effect dep see a stable object while idle.
  return useMemo(
    () => ({
      mutate,
      isLoading: state.isPending,
      isError: state.error !== undefined,
      error: state.error,
    }),
    [mutate, state]
  );
}
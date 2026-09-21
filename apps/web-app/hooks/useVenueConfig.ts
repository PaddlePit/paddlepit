"use client";

import { useQuery, type UseQueryResult } from "@/lib/query";
import { useBookingService } from "@/services/context";
import type { VenueConfig } from "@/types/booking";

export function useVenueConfig(): UseQueryResult<VenueConfig> {
  const service = useBookingService();
  return useQuery<VenueConfig>({
    queryKey: ["venue"],
    queryFn: () => service.getVenueConfig(),
  });
}
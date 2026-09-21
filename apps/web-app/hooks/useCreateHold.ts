"use client";

import { useMutation } from "@/lib/query";
import { useBookingService } from "@/services/context";
import type { CreateHoldRequest, CreateHoldResponse } from "@/types/booking";

export function useCreateHold() {
  const service = useBookingService();
  return useMutation<CreateHoldRequest, CreateHoldResponse>((req) => service.createHold(req));
}
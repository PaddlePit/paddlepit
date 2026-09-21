"use client";

import { useMutation } from "@/lib/query";
import { useBookingService } from "@/services/context";
import type { CheckoutRequest, CheckoutResponse } from "@/types/booking";

export function useCheckout() {
  const service = useBookingService();
  return useMutation<{ request: CheckoutRequest; idempotencyKey: string }, CheckoutResponse>(
    ({ request, idempotencyKey }) => service.checkout(request, idempotencyKey)
  );
}
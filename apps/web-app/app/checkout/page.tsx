import { Suspense } from "react";
import { BookingServiceProvider } from "@/services/context";
import { CheckoutFlow } from "@/components/booking/CheckoutFlow";

export default function CheckoutPage() {
  return (
    <BookingServiceProvider>
      <Suspense fallback={null}>
        <CheckoutFlow />
      </Suspense>
    </BookingServiceProvider>
  );
}
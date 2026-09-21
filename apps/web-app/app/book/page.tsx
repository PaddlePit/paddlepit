import { BookingServiceProvider } from "@/services/context";
import { BookingPage } from "@/components/booking/BookingPage";

export default function BookPage() {
  return (
    <BookingServiceProvider>
      <BookingPage />
    </BookingServiceProvider>
  );
}
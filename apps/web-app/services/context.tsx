"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { BookingService } from "./bookingService";
import { bookingService } from "./index";

const BookingServiceContext = createContext<BookingService>(bookingService);

/**
 * Swappable service context. Tests / fixtures can wrap the app with their own
 * BookingService; leaf components only ever see `useBookingService()`.
 */
export function BookingServiceProvider({
  children,
  service,
}: {
  children: ReactNode;
  service?: BookingService;
}) {
  return (
    <BookingServiceContext.Provider value={service ?? bookingService}>
      {children}
    </BookingServiceContext.Provider>
  );
}

export function useBookingService(): BookingService {
  return useContext(BookingServiceContext);
}
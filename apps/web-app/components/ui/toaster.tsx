"use client"

import { Toaster as SonnerToaster } from "sonner"

/** Sonner toast themed to the PaddlePit tokens (cream card, emerald accents). */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      gap={8}
      offset={72}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "!bg-cream !text-emerald-deep !border !border-emerald-deep/10 !rounded-2xl !shadow-lg !font-sans !text-sm",
          title: "!text-emerald-deep !font-medium",
          description: "!text-emerald-deep/60 !text-xs",
          actionButton: "!bg-emerald-deep !text-cream !rounded-xl",
          cancelButton: "!bg-emerald-light !text-emerald-deep !rounded-xl",
          closeButton:
            "!bg-emerald-light !text-emerald-deep hover:!bg-gold-light hover:!text-emerald-deep",
          error: "!border-clay-mid/40",
          success: "!border-emerald-deep/15",
        },
      }}
    />
  )
}
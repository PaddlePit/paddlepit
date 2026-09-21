import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 gap-1 w-fit whitespace-nowrap text-xs font-medium transition-colors shrink-0 [&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:size-3 outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-emerald-deep text-cream",
        emerald: "border-emerald-deep/15 bg-emerald-light text-emerald-deep",
        gold: "border-gold/35 bg-gold/15 text-emerald-deep",
        cream: "border-cream/15 bg-cream/10 text-cream",
        outline: "border-emerald-deep/15 bg-transparent text-emerald-deep",
        secondary: "border-emerald-deep/10 bg-emerald-pale text-emerald-mid",
        destructive: "border-clay-mid/40 bg-clay-pale text-clay-deep",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
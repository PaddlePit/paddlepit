"use client";

import type { CustomerInfo } from "@/types/booking";

export type CustomerErrors = Partial<Record<"name" | "email" | "phone", string>>;

interface CheckoutCustomerFormProps {
  value: CustomerInfo;
  errors: CustomerErrors;
  onChange: (next: CustomerInfo) => void;
}

const labelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide text-emerald-deep/50 uppercase";
const inputBase =
  "w-full rounded-xl border bg-white/60 px-3.5 py-2.5 text-sm text-emerald-deep transition-colors outline-none placeholder:text-emerald-deep/35 focus:bg-white";
const inputOk = `${inputBase} border-emerald-deep/15 focus:border-emerald-deep/40`;
const inputBad = `${inputBase} border-clay-mid/60 focus:border-clay-mid`;

export function CheckoutCustomerForm({
  value,
  errors,
  onChange,
}: CheckoutCustomerFormProps) {
  const set = (patch: Partial<CustomerInfo>) => onChange({ ...value, ...patch });

  return (
    <section className="rounded-2xl border border-emerald-deep/10 bg-cream p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-semibold tracking-wider text-emerald-deep/50 uppercase">
        Customer information
      </h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="pp-checkout-name" className={labelClass}>
            Full name <span className="text-clay-deep">*</span>
          </label>
          <input
            id="pp-checkout-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Juan Dela Cruz"
            value={value.name}
            onChange={(e) => set({ name: e.target.value })}
            className={errors.name ? inputBad : inputOk}
          />
          {errors.name && <p className="mt-1 text-xs font-medium text-clay-deep">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="pp-checkout-email" className={labelClass}>
            Email <span className="text-clay-deep">*</span>
          </label>
          <input
            id="pp-checkout-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="juan@example.com"
            value={value.email}
            onChange={(e) => set({ email: e.target.value })}
            className={errors.email ? inputBad : inputOk}
          />
          {errors.email && (
            <p className="mt-1 text-xs font-medium text-clay-deep">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="pp-checkout-phone" className={labelClass}>
            Phone <span className="text-emerald-deep/35">(optional)</span>
          </label>
          <input
            id="pp-checkout-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="09xx xxx xxxx"
            value={value.phone ?? ""}
            onChange={(e) => set({ phone: e.target.value })}
            className={errors.phone ? inputBad : inputOk}
          />
          {errors.phone && (
            <p className="mt-1 text-xs font-medium text-clay-deep">{errors.phone}</p>
          )}
        </div>
      </div>
    </section>
  );
}
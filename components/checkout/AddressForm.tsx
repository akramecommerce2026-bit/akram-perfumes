"use client";

import { CheckoutSection } from "@/components/checkout/CheckoutSection";
import { FormField } from "@/components/checkout/FormField";
import { SelectField } from "@/components/checkout/SelectField";
import { INDIAN_STATES } from "@/lib/checkout-schema";

/**
 * Contact + shipping address fields. Purely declarative — all state, validation
 * and submission live in the parent form via React Hook Form context.
 */
export function AddressForm() {
  return (
    <>
      <CheckoutSection step={1} title="Contact Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="fullName" label="Full Name" autoComplete="name" placeholder="Aarav Sharma" />
          <FormField
            name="mobile"
            label="Mobile Number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="9876543210"
          />
          <FormField
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="sm:col-span-2"
          />
        </div>
      </CheckoutSection>

      <CheckoutSection step={2} title="Shipping Address">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="line1"
            label="Address Line 1"
            autoComplete="address-line1"
            placeholder="House / flat, building, street"
            className="sm:col-span-2"
          />
          <FormField
            name="line2"
            label="Address Line 2"
            autoComplete="address-line2"
            placeholder="Area, colony"
            optional
            className="sm:col-span-2"
          />
          <FormField
            name="landmark"
            label="Landmark"
            placeholder="Near…"
            optional
            className="sm:col-span-2"
          />
          <FormField name="city" label="City" autoComplete="address-level2" placeholder="Mumbai" />
          <SelectField name="state" label="State" options={INDIAN_STATES} placeholder="Select state" />
          <FormField
            name="pincode"
            label="Pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="400001"
          />
          <FormField name="country" label="Country" autoComplete="country-name" placeholder="India" />
        </div>
      </CheckoutSection>
    </>
  );
}

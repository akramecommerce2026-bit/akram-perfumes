"use client";

import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronDown } from "lucide-react";

import type { CheckoutFormValues } from "@/lib/checkout-schema";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  name: keyof CheckoutFormValues;
  label: string;
  options: readonly string[];
  placeholder?: string;
  className?: string;
}

/** Accessible, RHF-bound select. Mirrors FormField's error handling. */
export function SelectField({ name, label, options, placeholder, className }: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>();
  const error = errors[name];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...register(name)}
          className={cn(
            "h-11 w-full appearance-none rounded-lg border bg-background px-3.5 pr-10 text-sm text-foreground transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            error ? "border-destructive focus-visible:outline-destructive" : "border-border focus-visible:border-accent",
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      {error?.message && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-destructive motion-safe:animate-in motion-safe:fade-in motion-safe:duration-(--animate-duration-hover)"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}

"use client";

import { useId } from "react";
import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";

import type { CheckoutFormValues } from "@/lib/checkout-schema";
import { cn } from "@/lib/utils";

type FieldName = keyof CheckoutFormValues;

interface FormFieldProps {
  name: FieldName;
  label: string;
  type?: "text" | "email" | "tel";
  placeholder?: string;
  autoComplete?: string;
  optional?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric";
  className?: string;
}

/**
 * Accessible, RHF-bound text field. Reads register + errors from form context so
 * the address form stays declarative. Wires label/input/error together with
 * ids + aria-invalid/aria-describedby for screen readers.
 */
export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  optional = false,
  inputMode,
  className,
}: FormFieldProps) {
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
        {optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...register(name)}
        className={cn(
          "h-11 w-full rounded-lg border bg-background px-3.5 text-sm text-foreground transition-colors",
          "placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          error ? "border-destructive focus-visible:outline-destructive" : "border-border focus-visible:border-accent",
        )}
      />
      <AnimatePresence initial={false}>
        {error?.message && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-destructive"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

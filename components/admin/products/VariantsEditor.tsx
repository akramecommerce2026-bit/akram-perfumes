"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";

import { Field, TextInput } from "@/components/admin/ui/form-fields";
import { Toggle } from "@/components/admin/ui/Toggle";
import type { ProductFormValues } from "@/lib/admin/product-schema";
import { cn } from "@/lib/utils";

const NEW_VARIANT = {
  variantName: "",
  price: 0,
  comparePrice: null,
  sku: "",
  stock: 0,
  lowStockThreshold: 5,
  active: true,
} as const;

export function VariantsEditor() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "variants" });

  const rootError = errors.variants?.message ?? errors.variants?.root?.message;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Variants</h2>
          <p className="text-xs text-muted-foreground">
            Sizes, prices and stock. A product can have unlimited variants.
          </p>
        </div>
        <button
          type="button"
          onClick={() => append({ ...NEW_VARIANT })}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="size-4" aria-hidden="true" /> Add Variant
        </button>
      </header>

      {rootError && <p className="text-xs text-destructive">{rootError}</p>}

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const variantErrors = errors.variants?.[index];
          const active = watch(`variants.${index}.active`);
          return (
            <div key={field.id} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
                  Variant {index + 1}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === fields.length - 1}
                    aria-label="Move down"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Delete variant"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <Field label="Size" htmlFor={`v-${index}-name`} error={variantErrors?.variantName?.message} className="col-span-2 sm:col-span-1">
                  <TextInput id={`v-${index}-name`} placeholder="6ml" {...register(`variants.${index}.variantName`)} aria-invalid={!!variantErrors?.variantName} />
                </Field>
                <Field label="Price (₹)" htmlFor={`v-${index}-price`} error={variantErrors?.price?.message}>
                  <TextInput id={`v-${index}-price`} type="number" min="0" step="0.01" {...register(`variants.${index}.price`)} aria-invalid={!!variantErrors?.price} />
                </Field>
                <Field label="MRP (₹)" htmlFor={`v-${index}-mrp`} error={variantErrors?.comparePrice?.message} optional>
                  <TextInput id={`v-${index}-mrp`} type="number" min="0" step="0.01" {...register(`variants.${index}.comparePrice`)} aria-invalid={!!variantErrors?.comparePrice} />
                </Field>
                <Field label="SKU" htmlFor={`v-${index}-sku`} error={variantErrors?.sku?.message}>
                  <TextInput id={`v-${index}-sku`} placeholder="AKR-XXX-006" {...register(`variants.${index}.sku`)} aria-invalid={!!variantErrors?.sku} />
                </Field>
                <Field label="Stock" htmlFor={`v-${index}-stock`} error={variantErrors?.stock?.message}>
                  <TextInput id={`v-${index}-stock`} type="number" min="0" step="1" {...register(`variants.${index}.stock`)} aria-invalid={!!variantErrors?.stock} />
                </Field>
                <Field label="Low stock at" htmlFor={`v-${index}-low`} error={variantErrors?.lowStockThreshold?.message}>
                  <TextInput id={`v-${index}-low`} type="number" min="0" step="1" {...register(`variants.${index}.lowStockThreshold`)} aria-invalid={!!variantErrors?.lowStockThreshold} />
                </Field>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Toggle
                  checked={active}
                  onChange={(checked) => setValue(`variants.${index}.active`, checked, { shouldDirty: true })}
                />
                <span className={cn("text-sm", active ? "text-foreground" : "text-muted-foreground")}>
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

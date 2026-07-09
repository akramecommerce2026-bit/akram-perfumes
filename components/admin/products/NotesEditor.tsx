"use client";

import { useFormContext } from "react-hook-form";

import { ChipsInput } from "@/components/admin/products/ChipsInput";
import { Field } from "@/components/admin/ui/form-fields";
import type { ProductFormValues } from "@/lib/admin/product-schema";

const GROUPS = [
  { name: "topNotes", label: "Top Notes", placeholder: "e.g. Bergamot, Saffron" },
  { name: "heartNotes", label: "Heart Notes", placeholder: "e.g. Oud, Rose" },
  { name: "baseNotes", label: "Base Notes", placeholder: "e.g. Amber, Musk" },
] as const;

export function NotesEditor() {
  const { watch, setValue } = useFormContext<ProductFormValues>();

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <header>
        <h2 className="font-heading text-lg font-semibold text-foreground">Fragrance Notes</h2>
        <p className="text-xs text-muted-foreground">Press Enter or comma to add a note.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {GROUPS.map((group) => (
          <Field key={group.name} label={group.label} htmlFor={group.name}>
            <ChipsInput
              id={group.name}
              value={watch(group.name)}
              onChange={(next) => setValue(group.name, next, { shouldDirty: true })}
              placeholder={group.placeholder}
            />
          </Field>
        ))}
      </div>
    </section>
  );
}

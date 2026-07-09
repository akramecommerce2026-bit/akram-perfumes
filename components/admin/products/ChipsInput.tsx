"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { fieldControlClass } from "@/components/admin/ui/form-fields";
import { cn } from "@/lib/utils";

interface ChipsInputProps {
  value: readonly string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
}

/** Repeatable tag/chip input (Enter or comma to add, backspace to remove last). */
export function ChipsInput({ value, onChange, placeholder, id }: ChipsInputProps) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const item = raw.trim();
    if (!item) return;
    if (value.some((v) => v.toLowerCase() === item.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, item]);
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      removeAt(value.length - 1);
    }
  }

  return (
    <div className={cn(fieldControlClass, "flex h-auto min-h-10 flex-wrap items-center gap-1.5 py-1.5")}>
      {value.map((chip, index) => (
        <span
          key={`${chip}-${index}`}
          className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] py-0.5 pr-1 pl-2.5 text-xs font-medium text-accent-foreground"
        >
          {chip}
          <button
            type="button"
            onClick={() => removeAt(index)}
            aria-label={`Remove ${chip}`}
            className="flex size-4 items-center justify-center rounded-full text-accent-foreground/70 transition-colors hover:bg-accent/30 hover:text-accent-foreground"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => add(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="h-6 flex-1 border-0 bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}

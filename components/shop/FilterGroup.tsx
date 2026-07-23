"use client";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroupProps {
  title: string;
  /** Shared name for radio grouping. */
  name: string;
  options: readonly FilterOption[];
  selected: readonly string[];
  /** Checkbox (multi-select) when true, radio (single-select) when false. */
  multiple?: boolean;
  onToggle: (value: string) => void;
}

/**
 * A reusable, presentational filter group. Works for both single-select
 * (categories, price) and multi-select (gender, family, occasion) facets, so
 * every filter in the sidebar and drawer shares one implementation.
 */
export function FilterGroup({
  title,
  name,
  options,
  selected,
  multiple = false,
  onToggle,
}: FilterGroupProps) {
  function isChecked(value: string): boolean {
    if (multiple) return selected.includes(value);
    if (value === "") return selected.length === 0;
    return selected.includes(value);
  }

  return (
    <fieldset className="flex flex-col gap-3.5">
      <legend className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </legend>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <label
            key={option.value || "all"}
            className="flex cursor-pointer items-center gap-2.5 text-[14px] text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={option.value}
              checked={isChecked(option.value)}
              onChange={() => onToggle(option.value)}
              className="size-4 shrink-0 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <span className="flex-1">{option.label}</span>
            {typeof option.count === "number" && (
              <span className="text-xs text-muted-foreground/70">{option.count}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

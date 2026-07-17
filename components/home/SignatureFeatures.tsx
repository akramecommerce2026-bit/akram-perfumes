import { Clock, Flame, Leaf, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  { icon: Flame, title: "Premium Oud", description: "A deep, resinous oud at its beating heart." },
  { icon: Clock, title: "Long Lasting Performance", description: "Hours of rich, evolving sillage." },
  { icon: Sparkles, title: "Crafted for Every Occasion", description: "From daybreak to evening soirée." },
  { icon: Leaf, title: "Premium Ingredients", description: "Rare essences, sourced and blended with care." },
];

export function SignatureFeatures() {
  return (
    <ul className="flex flex-col gap-5">
      {features.map(({ icon: Icon, title, description }) => (
        <li key={title} className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/12 text-accent">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

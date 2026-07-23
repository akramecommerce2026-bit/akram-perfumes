import { Gem, MapPin, ShieldCheck, Truck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/common/container";
import { Surface } from "@/components/common/surface";

interface TrustItem {
  label: string;
  icon: LucideIcon;
}

const items: TrustItem[] = [
  { label: "Free Shipping", icon: Truck },
  { label: "Secure Payment", icon: ShieldCheck },
  { label: "Premium Quality", icon: Gem },
  { label: "Made in India", icon: MapPin },
  { label: "10,000+ Happy Customers", icon: Users },
];

/**
 * The reassurance strip, overlapping the hero's lower edge.
 *
 * Now a Server Component: it was a Client Component only to run an entrance
 * animation, which cost the page a bundle to fade in five static labels.
 */
export function TrustBar() {
  return (
    <Container className="relative z-20 -mt-10 lg:-mt-14">
      <Surface className="grid grid-cols-2 gap-x-4 gap-y-5 px-6 py-6 sm:grid-cols-3 lg:grid-cols-5 lg:px-8">
        {items.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 text-center lg:flex-row lg:gap-3 lg:text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-[13px] font-medium text-foreground sm:text-sm">{label}</span>
          </div>
        ))}
      </Surface>
    </Container>
  );
}

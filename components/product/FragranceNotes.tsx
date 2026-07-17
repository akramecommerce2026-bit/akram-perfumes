"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { GENDER_LABELS, OCCASION_LABELS, SEASON_LABELS } from "@/types/product-attributes";

const LONGEVITY_LABELS = ["", "Poor", "Weak", "Moderate", "Long Lasting", "Very Long"];
const PROJECTION_LABELS = ["", "Intimate", "Soft", "Moderate", "Strong", "Enormous"];

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div
      variants={item}
      className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-5"
    >
      <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </span>
      {children}
    </motion.div>
  );
}

function Chips({ values }: { values: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm text-foreground"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function ScaleBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index < score ? "bg-accent" : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

export function FragranceNotes({ product }: { product: Product }) {
  const { notes, profile, gender, occasions } = product;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="fragrance-notes-heading" className="flex flex-col gap-8">
        <h2 id="fragrance-notes-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
          Fragrance Notes
        </h2>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <InfoCard title="Top Notes">
            <Chips values={notes.top} />
          </InfoCard>
          <InfoCard title="Heart Notes">
            <Chips values={notes.heart} />
          </InfoCard>
          <InfoCard title="Base Notes">
            <Chips values={notes.base} />
          </InfoCard>
        </motion.div>

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <InfoCard title="Longevity">
            <ScaleBar score={profile.longevity} label={LONGEVITY_LABELS[profile.longevity]} />
          </InfoCard>
          <InfoCard title="Projection">
            <ScaleBar score={profile.projection} label={PROJECTION_LABELS[profile.projection]} />
          </InfoCard>
          <InfoCard title="Concentration">
            <p className="text-sm font-medium text-foreground">{profile.concentration}</p>
          </InfoCard>
          <InfoCard title="Gender">
            <p className="text-sm font-medium text-foreground">{GENDER_LABELS[gender]}</p>
          </InfoCard>
          <InfoCard title="Season">
            <Chips values={profile.seasons.map((season) => SEASON_LABELS[season])} />
          </InfoCard>
          <InfoCard title="Occasion">
            <Chips values={occasions.map((occasion) => OCCASION_LABELS[occasion])} />
          </InfoCard>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

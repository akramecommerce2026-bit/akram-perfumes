"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/toast";
import { deleteSignatureCollectionAction } from "@/lib/admin/signature-collection-actions";
import { cn } from "@/lib/utils";
import type { AdminSignatureCollection } from "@/types/signature-collection";

interface SignatureCollectionsManagerProps {
  items: readonly AdminSignatureCollection[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function SignatureCollectionsManager({ items }: SignatureCollectionsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<AdminSignatureCollection | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteSignatureCollectionAction(deleteTarget.id);
      setDeleteTarget(null);
      if (result.ok) {
        toast({ title: "Section deleted", variant: "success" });
        router.refresh();
      } else {
        toast({ title: "Cannot delete section", description: result.error, variant: "error" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Signature Collection
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "section" : "sections"} on the homepage
          </p>
        </div>
        <Link
          href="/admin/signature/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:shadow-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden="true" /> Add Section
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <th className="w-20 px-4 py-3">Order</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Subtitle</th>
              <th className="px-4 py-3">Button</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="w-24 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  No sections yet. Add one to show the Signature Collection on the homepage.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 text-muted-foreground">{item.displayOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted">
                        {item.collectionImage ? (
                          <Image
                            src={item.collectionImage}
                            alt={item.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.subtitle || "—"}</td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-1">
                      {item.buttonText ? `${item.buttonText} → ${item.buttonUrl}` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        item.active
                          ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-accent-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/signature/${item.id}/edit`}
                        aria-label={`Edit ${item.title}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete section"
                        aria-label={`Delete ${item.title}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.title ?? "section"}?`}
        description="It will be removed from the homepage (soft delete) and can be restored from the database if needed."
        confirmLabel="Delete"
        destructive
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

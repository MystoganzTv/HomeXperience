"use client";

import { useState } from "react";
import { ArrowUpFromLine } from "lucide-react";
import type { PropertyDefinition } from "@/lib/types";
import { Modal } from "@/components/modal";
import { SectionCard } from "@/components/section-card";
import { UploadPanel } from "@/components/upload-panel";

export function ImportCenterLauncher({
  properties,
}: {
  properties: PropertyDefinition[];
}) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <SectionCard
        title="Bring your data"
        subtitle="Open the import flow in a focused modal, review the file calmly, and keep this page centered on import history and control."
        action={
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="workspace-button-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition"
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Import data
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="workspace-soft-card rounded-[24px] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
              Focused flow
            </p>
            <p className="mt-3 text-base font-medium text-[var(--workspace-text)]">
              Upload, review, and confirm inside a modal.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">
              This keeps Import Center clean while still giving imports their own dedicated experience.
            </p>
          </div>

          <div className="workspace-soft-card rounded-[24px] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">
              Supported
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Airbnb", "Booking.com", "Hostlyx Excel", "Financial statements"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--workspace-border)] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--workspace-muted)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <Modal
        open={isUploadOpen}
        title="Import data"
        onClose={() => setIsUploadOpen(false)}
      >
        <UploadPanel properties={properties} />
      </Modal>
    </>
  );
}

"use client";

import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  dismissible = true,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  dismissible?: boolean;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {dismissible ? (
        <button
          type="button"
          aria-label="Close modal"
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      )}
      <div className="workspace-card relative z-10 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[30px] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--workspace-text)]">{title}</h2>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              className="workspace-button-secondary rounded-full px-3 py-1.5 text-sm transition"
            >
              Close
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

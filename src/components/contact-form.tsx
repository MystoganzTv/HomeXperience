"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";

type ContactFormState = "idle" | "submitting" | "success" | "error";

const topicOptions = [
  "Billing",
  "Dashboard question",
  "Import issue",
  "Report sharing",
  "Partnership",
  "Other",
];

function inputClassName() {
  return "input-surface w-full rounded-2xl px-4 py-3 text-sm";
}

export function ContactForm() {
  const [status, setStatus] = useState<ContactFormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      topic: String(formData.get("topic") ?? "").trim(),
      workspace: String(formData.get("workspace") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Hostlyx could not send your message right now.");
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Hostlyx could not send your message right now.",
      );
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="workspace-soft-card rounded-[28px] p-6 sm:p-7">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-text)]">
            Send a message
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-100">
            We will get back to you by email.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Use this form for billing, imports, dashboard questions, partnerships, or anything else
            related to Hostlyx.
          </p>
        </div>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Name
              </span>
              <input className={inputClassName()} name="name" placeholder="Your name" required />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Email
              </span>
              <input
                className={inputClassName()}
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Topic
              </span>
              <select className={inputClassName()} name="topic" defaultValue="Billing" required>
                {topicOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-950 text-slate-100">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Workspace or account email
              </span>
              <input
                className={inputClassName()}
                name="workspace"
                placeholder="Optional context"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Message
            </span>
            <textarea
              className={`${inputClassName()} min-h-[180px] resize-y py-4`}
              name="message"
              placeholder="Tell us what is going on."
              required
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm leading-6 text-slate-400">
              {status === "success" ? (
                <p className="font-medium text-emerald-200">
                  Message sent. We will reply as soon as possible.
                </p>
              ) : status === "error" ? (
                <p className="font-medium text-amber-100">{errorMessage}</p>
              ) : (
                <p>Support requests are handled by email so the conversation stays easy to track.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="workspace-button-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <article className="workspace-soft-card rounded-[28px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-text)]">
            Contact email
          </p>
          <p className="mt-4 text-lg font-semibold text-slate-100">hello@hostlyx.com</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            If you prefer, you can still write to us directly from your inbox.
          </p>
        </article>

        <article className="workspace-soft-card rounded-[28px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-text)]">
            Helpful context
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <li>Include the account email tied to your workspace.</li>
            <li>Mention whether the issue is billing, imports, reporting, or product feedback.</li>
            <li>Add screenshots or file names in your message when relevant.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

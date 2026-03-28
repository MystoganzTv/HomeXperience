import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Contact | Hostlyx",
  description: "Contact Hostlyx for support, billing, or product questions.",
};

export default function ContactPage() {
  return (
    <LegalPageShell
      eyebrow="Support"
      title="Contact"
      description="Reach out for billing questions, data issues, product feedback, or operational support related to your Hostlyx workspace."
    >
      <ContactForm />
    </LegalPageShell>
  );
}

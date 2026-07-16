import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with our dealership team — ask about a vehicle, financing options, trade-ins, or schedule a test drive.",
};

interface PageProps {
  searchParams: Promise<{ subject?: string }>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { subject } = await searchParams;

  const defaultMessage = subject
    ? `Hi, I'm interested in the ${subject}. Could you tell me more about its availability and condition?`
    : "";

  return (
    <div className="container-edge py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="section-eyebrow">
          <span className="h-px w-8 bg-brass-400" />
          Get In Touch
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-ink sm:text-4xl">
          Contact Our Team
        </h1>
        <p className="mt-3 text-muted">
          Whether you have a question about a specific vehicle, financing
          options, or want to schedule a visit, send us a message and we&apos;ll
          respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="card-surface p-5 sm:p-8 lg:col-span-2">
          <ContactForm defaultMessage={defaultMessage} />
        </div>

        <div className="space-y-6">
          <div className="card-surface p-5 sm:p-6">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
              Showroom Info
            </h2>
            <ul className="mt-4 space-y-4 text-sm text-muted">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" />
                <span>{process.env.NEXT_PUBLIC_DEALER_ADDRESS}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brass-400" />
                <a href={`tel:${process.env.NEXT_PUBLIC_DEALER_PHONE}`} className="hover:text-ink">
                  {process.env.NEXT_PUBLIC_DEALER_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brass-400" />
                <a href={`mailto:${process.env.NEXT_PUBLIC_DEALER_EMAIL}`} className="hover:text-ink">
                  {process.env.NEXT_PUBLIC_DEALER_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brass-400" />
                <span>Mon – Sat: 8:00 AM – 5:00 PM</span>
              </li>
            </ul>
          </div>

          <div className="card-surface p-5 sm:p-6">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-brass-400">
              Prefer Instant Chat?
            </h2>
            <p className="mt-3 text-sm text-muted">
              Message us directly on WhatsApp for the fastest response on
              vehicle availability and pricing.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_DEALER_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-4 w-full border-emerald-500/30 text-emerald-300 hover:border-emerald-400"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

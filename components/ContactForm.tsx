"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { contactSchema, type ContactInput } from "@/schemas/contact-review.schema";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

interface ContactFormProps {
  defaultMessage?: string;
}

export default function ContactForm({ defaultMessage = "" }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: defaultMessage, website: "" },
  });

  async function onSubmit(values: ContactInput) {
    setStatus("idle");
    setServerError(null);

    try {
      const recaptchaToken = await getRecaptchaToken("contact");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, recaptchaToken }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      reset({ name: "", email: "", phone: "", message: defaultMessage, website: "" });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Honeypot field — hidden from real users */}
      <div className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label-field">Full Name</label>
          <input id="name" type="text" className="input-field" placeholder="John Doe" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="label-field">Phone Number</label>
          <input id="phone" type="tel" className="input-field" placeholder="+1 234 567 8900" {...register("phone")} />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="label-field">Email Address</label>
        <input id="email" type="email" className="input-field" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="label-field">Message</label>
        <textarea
          id="message"
          rows={4}
          className="input-field resize-none"
          placeholder="Tell us which vehicle you're interested in or how we can help…"
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
      </div>

      {status === "success" && (
        <div className="flex items-start gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Thank you! Your message has been sent — our team will get back to you shortly.</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-60">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send Message"
        )}
      </button>

      <p className="text-center text-xs text-muted">
        Protected by reCAPTCHA and subject to rate limiting to prevent spam.
      </p>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const message = String(form.get("message") || "").trim();

    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = "Please enter your name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Please enter a valid email address.";
    if (!subject) nextErrors.subject = "Please enter a subject.";
    if (!message || message.length < 20)
      nextErrors.message = "Your message must be at least 20 characters.";
    if (message.length > 3000)
      nextErrors.message = "Your message cannot exceed 3000 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again later.");
        setStatus("error");
        return;
      }
      setStatus("success");
      formEl.reset();
    } catch {
      setServerError("Something went wrong. Please try again later.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 p-6 text-center">
        <p className="text-[var(--color-success)]">
          Thank you for your message. I&apos;ve received it and will get back
          to you as soon as possible.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          Full Name
        </label>
        <input id="name" name="name" type="text" className={inputClass} />
        {errors.name && <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email Address
        </label>
        <input id="email" name="email" type="email" className={inputClass} />
        {errors.email && <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
          Subject
        </label>
        <input id="subject" name="subject" type="text" className={inputClass} />
        {errors.subject && <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea id="message" name="message" rows={6} className={inputClass} />
        {errors.message && <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.message}</p>}
      </div>

      {serverError && <p className="text-sm text-[var(--color-error)]">{serverError}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 inline-flex items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
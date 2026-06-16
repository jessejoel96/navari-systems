"use client";

import { useState } from "react";

const selectClass =
  "w-full rounded border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none focus:border-gold [&>option]:bg-white [&>option]:text-navy";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company") || undefined,
          industry: data.get("industry") || undefined,
          service_interest: data.get("service_interest") || undefined,
          message: data.get("message"),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-lg text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-sm uppercase tracking-wide text-silver-dark-bg">Name</span>
          <input name="name" required className="w-full rounded border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-sm uppercase tracking-wide text-silver-dark-bg">Email</span>
          <input name="email" type="email" required className="w-full rounded border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none focus:border-gold" />
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-sm uppercase tracking-wide text-silver-dark-bg">Company (optional)</span>
          <input name="company" className="w-full rounded border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-sm uppercase tracking-wide text-silver-dark-bg">Industry (optional)</span>
          <select name="industry" className={selectClass}>
            <option value="">Select industry</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Online Education">Online Education</option>
            <option value="Professional Services">Professional Services</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Marketing Agencies">Marketing Agencies</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block font-mono text-sm uppercase tracking-wide text-silver-dark-bg">Service interest (optional)</span>
        <select name="service_interest" className={selectClass}>
          <option value="">Select service</option>
          <option value="The Navari Audit">The Navari Audit ($497)</option>
          <option value="The Navari Build">The Navari Build (from $800)</option>
          <option value="Infrastructure Expansion">Infrastructure Expansion (from $500/mo)</option>
          <option value="Not sure yet">Not sure yet</option>
        </select>
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block font-mono text-sm uppercase tracking-wide text-silver-dark-bg">Message</span>
        <textarea name="message" required rows={4} className="w-full rounded border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none focus:border-gold" />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded bg-gold px-8 py-4 font-display text-[15px] font-bold tracking-wide text-navy transition-colors hover:bg-gold-light disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
      {status === "success" && <p className="mt-3 text-base text-emerald-400">Message received. Navari Systems will respond within one business day.</p>}
      {status === "error" && <p className="mt-3 text-base text-red-400">{error}</p>}
    </form>
  );
}

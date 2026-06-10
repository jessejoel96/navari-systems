"use client";

import { useState } from "react";

export function NewsletterForm({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const email = new FormData(form).get("email");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          className="flex-1 rounded border border-gold-border bg-white px-4 py-3 text-sm outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded bg-navy px-6 py-3 font-display text-[12px] font-bold tracking-wider text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {status === "success" && <p className="mt-2 text-sm text-emerald-600">You are subscribed. Welcome aboard.</p>}
      {status === "error" && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "XAF"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function sageDateFormat(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    received: "bg-gray-100 text-gray-700",
    extracted: "bg-blue-50 text-blue-700",
    reviewed: "bg-indigo-50 text-indigo-700",
    matched: "bg-violet-50 text-violet-700",
    pending_approval: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    sage_exported: "bg-cyan-50 text-cyan-700",
    sage_imported: "bg-teal-50 text-teal-700",
    payment_scheduled: "bg-orange-50 text-orange-700",
    paid: "bg-green-50 text-green-800",
    cancelled: "bg-gray-50 text-gray-400",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function getStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

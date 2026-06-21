import { redirect } from "next/navigation";

// Maviance is now part of the unified Payments module (tab: maviance)
export default function MaviancePage() {
  redirect("/payments");
}

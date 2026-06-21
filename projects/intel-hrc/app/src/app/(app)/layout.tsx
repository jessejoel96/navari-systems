import { Sidebar } from "@/components/layout/Sidebar";
import { AppMain } from "@/components/layout/AppMain";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F9FB]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <AppMain>{children}</AppMain>
        </div>
      </main>
    </div>
  );
}

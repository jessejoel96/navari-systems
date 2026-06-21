import { AssistantChat } from "@/components/assistant/AssistantChat";
import { AppPageHeader } from "@/components/layout/AppPageHeader";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <AppPageHeader
        title="AI Assistant"
        description="Ask about invoices, approvals, payment status, or get help drafting follow-ups."
      />
      <AssistantChat />
    </div>
  );
}

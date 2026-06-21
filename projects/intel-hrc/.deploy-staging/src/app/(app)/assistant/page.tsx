import { AssistantChat } from "@/components/assistant/AssistantChat";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ask about invoices, approvals, payment status, or get help drafting follow-ups.
        </p>
      </div>
      <AssistantChat />
    </div>
  );
}

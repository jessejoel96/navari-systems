/**
 * Email parser — classifies incoming emails and extracts actionable metadata.
 *
 * Intents:
 *   invoice        — supplier sending an invoice (attachment expected)
 *   payment_request — supplier requesting payment / following up on unpaid
 *   po_response     — supplier responding to a PO or proforma
 *   query           — supplier or internal asking for information
 *   follow_up       — someone following up on a previous request
 *   approval        — CFO or manager responding to an approval request
 *   cash_request    — regional office submitting a cash request
 *   justification   — regional office sending justification documents
 *   other           — unclassified
 */

export type EmailIntent =
  | "invoice"
  | "payment_request"
  | "po_response"
  | "query"
  | "follow_up"
  | "approval"
  | "cash_request"
  | "justification"
  | "other";

export interface ParsedEmail {
  intent: EmailIntent;
  confidence: "high" | "medium" | "low";
  supplier_name: string | null;
  invoice_number: string | null;
  po_number: string | null;
  amount: number | null;
  currency: string;
  entity_hint: string | null;
  urgency: "normal" | "urgent" | "overdue";
  action_required: string;
  summary: string;
  has_attachment: boolean;
  demands: string[];
  requests_met: string[];
}

const EMAIL_PARSE_PROMPT = `You are an email classifier for the AP (Accounts Payable) department of Intel HRC, a payroll & employment services company.

Analyze the email below and classify it. Intel HRC operates 8 entities:
HQ (Intel HRC), CMR, CIV (Côte d'Ivoire), BF (Burkina Faso), SEN (Senegal), RDC (DR Congo), NIGER, MALI.

Respond ONLY with valid JSON:
{
  "intent": "invoice|payment_request|po_response|query|follow_up|approval|cash_request|justification|other",
  "confidence": "high|medium|low",
  "supplier_name": "string or null",
  "invoice_number": "string or null — extract invoice/facture number if mentioned",
  "po_number": "string or null — extract PO/proforma/bon de commande number",
  "amount": number or null,
  "currency": "XAF",
  "entity_hint": "HQ|CMR|CIV|BF|SEN|RDC|NIGER|MALI or null",
  "urgency": "normal|urgent|overdue",
  "action_required": "what Tina should do next — one short sentence",
  "summary": "2-3 sentence summary of the email content",
  "has_attachment": true/false,
  "demands": ["list of things the sender is asking for or demanding"],
  "requests_met": ["list of previously requested items that this email fulfills — e.g. 'invoice copy provided', 'delivery note attached', 'price confirmed'"]
}

Classification rules:
- "invoice": email contains or references a new invoice/facture to be processed
- "payment_request": sender is asking about payment status or demanding payment
- "po_response": supplier responding to a PO or confirming a proforma
- "query": asking for information (account balance, invoice status, etc.)
- "follow_up": referencing a previous email thread, chasing a response
- "approval": someone approving or rejecting something
- "cash_request": regional office requesting cash disbursement
- "justification": documents proving how cash was spent
- "other": doesn't fit above categories

For demands: extract specific asks — "please pay invoice X", "need PO for delivery", "send updated SOA"
For requests_met: identify what this email resolves — "delivery note attached", "signed approval attached", "corrected invoice sent"

Urgency rules:
- "overdue": mentions overdue, past due, en retard, urgent payment needed
- "urgent": mentions ASAP, urgent, priority, rapidement
- "normal": everything else`;

export async function parseEmail(
  subject: string,
  body: string,
  from: string,
  hasAttachments: boolean
): Promise<ParsedEmail> {
  const emailContent = `From: ${from}
Subject: ${subject}
Has attachments: ${hasAttachments ? "Yes" : "No"}

Body:
${body.slice(0, 4000)}`;

  const response = await fetch(
    `${process.env.QWEN_API_BASE_URL}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.QWEN_MODEL,
        messages: [
          { role: "system", content: EMAIL_PARSE_PROMPT },
          { role: "user", content: emailContent },
        ],
        max_tokens: 1024,
        temperature: 0.1,
      }),
    }
  );

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const parsed = JSON.parse(jsonStr) as ParsedEmail;
    parsed.has_attachment = hasAttachments;
    return parsed;
  } catch {
    return {
      intent: "other",
      confidence: "low",
      supplier_name: null,
      invoice_number: null,
      po_number: null,
      amount: null,
      currency: "XAF",
      entity_hint: null,
      urgency: "normal",
      action_required: "Review this email manually",
      summary: "Could not parse email automatically.",
      has_attachment: hasAttachments,
      demands: [],
      requests_met: [],
    };
  }
}

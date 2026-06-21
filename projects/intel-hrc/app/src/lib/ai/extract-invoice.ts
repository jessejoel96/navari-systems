/**
 * Invoice OCR extraction using OpenAI Vision.
 * Takes a base64-encoded image or PDF page and returns structured fields
 * with confidence levels for each extraction.
 */

export interface ExtractedField<T = string> {
  value: T;
  confidence: "high" | "medium" | "low";
}

export interface ExtractedInvoice {
  supplier_name: ExtractedField;
  invoice_number: ExtractedField;
  invoice_date: ExtractedField;
  due_date: ExtractedField;
  description: ExtractedField;
  currency: ExtractedField;
  gross_amount: ExtractedField<number>;
  net_amount: ExtractedField<number>;
  vat_amount: ExtractedField<number>;
  wht_amount: ExtractedField<number>;
  po_number: ExtractedField;
  tax_id: ExtractedField;
  suggested_entity: ExtractedField;
  suggested_invoice_type: ExtractedField;
  suggested_expense_account: ExtractedField;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  raw_text: string;
}

const EXTRACTION_PROMPT = `You are an AP (Accounts Payable) invoice extraction system for Intel HRC, a payroll & employment services company operating across West/Central Africa.

Extract structured data from this invoice image. The company operates 8 entities:
- Intel HRC (HQ, Cameroon) — journal PURC, 8-digit accounts
- IOS CMR (Cameroon), IOS CIV (Côte d'Ivoire), IOS BF (Burkina Faso), IOS SEN (Senegal), IOS RDC (DR Congo), IOS NIGER (Niger), IOS MALI (Mali) — all use journal ACH, 6-7 digit accounts

Currency is typically XAF (FCFA). Common invoice types:
- "consultancy_wht": Professional/consultancy fees with 20% withholding tax
- "vat": Standard goods/services with VAT (e.g. telecom, supplies)
- "standard": Simple invoice, no VAT or WHT
- "intercompany": Invoice that will be split across multiple entities

Common expense accounts:
- 6324400: Professional/consultancy fees
- 62811100: Telecom/communications (HQ, 8-digit)
- 6222100: Rent
- 6251100: Insurance
- 6345000: Software licenses

Respond ONLY with valid JSON matching this schema:
{
  "supplier_name": {"value": "string", "confidence": "high|medium|low"},
  "invoice_number": {"value": "string", "confidence": "high|medium|low"},
  "invoice_date": {"value": "YYYY-MM-DD", "confidence": "high|medium|low"},
  "due_date": {"value": "YYYY-MM-DD or empty", "confidence": "high|medium|low"},
  "description": {"value": "string", "confidence": "high|medium|low"},
  "currency": {"value": "XAF", "confidence": "high|medium|low"},
  "gross_amount": {"value": number, "confidence": "high|medium|low"},
  "net_amount": {"value": number, "confidence": "high|medium|low"},
  "vat_amount": {"value": number, "confidence": "high|medium|low"},
  "wht_amount": {"value": number, "confidence": "high|medium|low"},
  "po_number": {"value": "string or empty", "confidence": "high|medium|low"},
  "tax_id": {"value": "string or empty", "confidence": "high|medium|low"},
  "suggested_entity": {"value": "HQ|CMR|CIV|BF|SEN|RDC|NIGER|MALI", "confidence": "high|medium|low"},
  "suggested_invoice_type": {"value": "standard|consultancy_wht|vat|intercompany|prepaid_accrual", "confidence": "high|medium|low"},
  "suggested_expense_account": {"value": "string", "confidence": "high|medium|low"},
  "line_items": [{"description": "string", "quantity": number, "unit_price": number, "amount": number}],
  "raw_text": "full text visible on the invoice"
}

Rules:
- All amounts should be integers (FCFA has no decimals)
- If a field is not visible, set value to "" or 0 and confidence to "low"
- If WHT is present, set invoice_type to "consultancy_wht"
- If VAT is present, set invoice_type to "vat"
- Infer entity from context clues (address, recipient name, language)
- For gross_amount: if VAT invoice, gross = net + vat. If WHT, gross is the fee before deduction.`;

export async function extractInvoiceFromImage(
  base64Image: string,
  mimeType: string = "image/png"
): Promise<ExtractedInvoice> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: "Extract all invoice fields from this document.",
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  // Strip markdown code fences if present
  const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(jsonStr) as ExtractedInvoice;
  } catch {
    return {
      supplier_name: { value: "", confidence: "low" },
      invoice_number: { value: "", confidence: "low" },
      invoice_date: { value: "", confidence: "low" },
      due_date: { value: "", confidence: "low" },
      description: { value: "", confidence: "low" },
      currency: { value: "XAF", confidence: "medium" },
      gross_amount: { value: 0, confidence: "low" },
      net_amount: { value: 0, confidence: "low" },
      vat_amount: { value: 0, confidence: "low" },
      wht_amount: { value: 0, confidence: "low" },
      po_number: { value: "", confidence: "low" },
      tax_id: { value: "", confidence: "low" },
      suggested_entity: { value: "", confidence: "low" },
      suggested_invoice_type: { value: "standard", confidence: "low" },
      suggested_expense_account: { value: "", confidence: "low" },
      line_items: [],
      raw_text: content,
    };
  }
}

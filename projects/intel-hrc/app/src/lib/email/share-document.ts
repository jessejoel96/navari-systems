import { Resend } from "resend";
import { categoryLabel } from "@/lib/documents/constants";
import { formatLabel } from "@/lib/documents/formats";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function shareDocumentByEmail(input: {
  to: string[];
  sharedBy: string;
  message?: string;
  document: {
    id: string;
    title: string;
    description?: string | null;
    category: string;
    file_format?: string | null;
    document_date?: string | null;
    file_name: string;
    storage_path: string;
  };
}) {
  const downloadUrl = `${APP_URL}/api/storage?path=${encodeURIComponent(input.document.storage_path)}`;
  const libraryUrl = `${APP_URL}/documents?doc=${input.document.id}`;

  const dateStr = input.document.document_date
    ? new Date(input.document.document_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const html = `
    <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background: #1F6DB3; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 16px;">Document shared with you</h2>
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">
          From ${input.sharedBy} · Intel HRC Document Library
        </p>
      </div>
      <div style="border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        ${input.message ? `<p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 16px; font-style: italic;">"${input.message}"</p>` : ""}
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6B7280; width: 110px;">Title</td>
            <td style="padding: 8px 0; font-weight: 600; color: #111827;">${input.document.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Category</td>
            <td style="padding: 8px 0; color: #111827;">${categoryLabel(input.document.category)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Format</td>
            <td style="padding: 8px 0; color: #111827;">${formatLabel(input.document.file_format ?? "other")} · ${input.document.file_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6B7280;">Document date</td>
            <td style="padding: 8px 0; color: #111827;">${dateStr}</td>
          </tr>
          ${
            input.document.description
              ? `<tr>
            <td style="padding: 8px 0; color: #6B7280; vertical-align: top;">Notes</td>
            <td style="padding: 8px 0; color: #111827;">${input.document.description}</td>
          </tr>`
              : ""
          }
        </table>
        <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
          <a href="${downloadUrl}"
             style="display: inline-block; background: #1F6DB3; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Download file
          </a>
          <a href="${libraryUrl}"
             style="display: inline-block; border: 1px solid #D1D5DB; color: #374151; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
            Open in library
          </a>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #9CA3AF;">
          Intel HRC AP Workflow · Document Library
        </p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: input.to,
    cc: process.env.AP_ACCOUNTANT_EMAIL,
    subject: `[Shared] ${input.document.title} — ${categoryLabel(input.document.category)}`,
    html,
  });
}

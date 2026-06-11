import { SITE } from "@/lib/constants";

export function contactNotificationHtml(data: {
  name: string;
  email: string;
  company?: string;
  industry?: string;
  service_interest?: string;
  message: string;
}) {
  return `
    <h2>New contact submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ""}
    ${data.industry ? `<p><strong>Industry:</strong> ${escapeHtml(data.industry)}</p>` : ""}
    ${data.service_interest ? `<p><strong>Service interest:</strong> ${escapeHtml(data.service_interest)}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
  `;
}

export function contactAutoReplyHtml(name: string) {
  return `
    <p>Hi ${escapeHtml(name)},</p>
    <p>Your message has been received by Navari Systems. We review every submission and respond within one business day.</p>
    <p>To book a free 30-minute operations review directly: <a href="${SITE.calendly}">${SITE.calendly}</a></p>
    <p>— Navari Systems</p>
  `;
}

export function newsletterWelcomeHtml() {
  return `
    <p>Welcome to The Navari Weekly.</p>
    <p>You will receive practical insights on operational automation, business teardowns, and build walkthroughs — written for business owners who run on manual processes they have not fixed yet.</p>
    <p>First insight coming soon. In the meantime, explore the blog at <a href="${SITE.url}/blog">${SITE.url}/blog</a>.</p>
    <p>— Navari Systems</p>
  `;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

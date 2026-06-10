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
    <p>Thanks for reaching out to Navari Systems. I have received your message and will respond within one business day.</p>
    <p>If you would like to book a discovery call directly, you can do so here: <a href="${SITE.calendly}">${SITE.calendly}</a></p>
    <p>— Jesse-Joel Nzumafor<br>Navari Systems</p>
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

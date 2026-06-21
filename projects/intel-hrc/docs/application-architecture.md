# Intel HRC AP Workflow — Application Architecture (v2)

**Updated:** 20 Jun 2026 — post-discovery with Tina-Randa  
**Hosting:** Hostinger Node · subdomain  
**Stack:** Next.js + Supabase + Airtable + Qwen + Resend  
**Sage:** Manual `.txt` import/export only (no API)

---

## 1. Architecture overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Tina-Randa (AP Accountant)                    │
│  Upload scans/PDFs · Review OCR · Match PO · Generate exports       │
└──────────────┬──────────────────────────────┬───────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│  Next.js App (Hostinger)  │    │  Airtable (Operational UI)        │
│  ap.intelhrc.navari.systems│◄──►│  Tables · Dashboards · Reports   │
│  Workflow · Approvals · OCR│    │  Weekly KPIs · Portfolio views    │
└──────────────┬───────────┘    └──────────────────────────────────┘
               │                              ▲
               ▼                              │ sync (webhook/cron)
┌──────────────────────────┐                  │
│  Supabase                 │─────────────────┘
│  Postgres · Auth · Storage│
│  RLS · pg_cron · Edge Fn  │
└──────────────┬───────────┘
               │
     ┌─────────┼─────────┬─────────────┐
     ▼         ▼         ▼             ▼
  Resend    Qwen API   ExcelJS    Sage .txt
  (email)   (AI assist) (exports)  (manual import)
```

### Layer responsibilities

| Layer | Role | Why |
|-------|------|-----|
| **Supabase** | Source of truth — invoices, approvals, entities, audit trail, file storage | Auth, RLS, 10-year retention, API backend |
| **Next.js on Hostinger** | Workflow engine — upload, OCR, match, approve, generate exports | Subdomain demo/production; Tina + CFO access |
| **Airtable** | Familiar spreadsheet UI — sort, filter, dashboards, weekly reports, graphics | Tina's daily operational view; less dev time for complex tables |
| **Qwen** | AI assistant — query AP data, suggest account codes, flag anomalies, draft follow-up emails | Cost-effective; interacts with structured Supabase/Airtable data |
| **Sage 100 Comptabilité** | Official GL — manual `.txt` import by Tina | No API; remains ledger of record |

---

## 2. What the demo preview includes

Hosted at **`ap.intelhrc.navari.systems`** (or staging subdomain).

| Module | Demo feature | User |
|--------|-------------|------|
| **Invoice inbox** | Upload PDF/scan → OCR extract → edit fields | Tina |
| **PO match** | Link invoice to PO; flag mismatches | Tina |
| **Intercompany split** | Allocate across 7 entities → preview per-entity `.txt` | Tina |
| **CFO approval** | Email with Approve/Reject links + web dashboard | Enow |
| **Approval tracker** | Status board — pending / approved / overdue / reminded | Tina, Finance |
| **Sage export** | Download `.txt` per entity (real format from sample) | Tina |
| **Bank payment sheet** | Auto-generate monthly Supplier Payment Sheet `.xlsx` | Tina |
| **Maviance sheet** | Auto-generate daily/weekly mobile payment tracker | Tina |
| **Regional intake** | Cash request form → validation queue | Tina |
| **Airtable sync** | Live invoice/payment tables + weekly report dashboard | All |
| **Qwen assistant** | "What's pending CFO approval?" / "Generate follow-up for supplier X" | Tina |

---

## 3. Data flow — invoice to payment

```
1. INTAKE
   Paper scan / PDF / email attachment / WhatsApp photo
   → Upload in app (or forward to ap-intake@navari.systems)
   → Supabase Storage + OCR (OpenAI Vision or Qwen-VL)
   → Invoice record created (status: received)

2. VALIDATE
   Tina reviews OCR fields
   → Links PO (proforma → PO → invoice → delivery note chain)
   → If intercompany: opens split grid (7 entity columns)
   → Tax compliance check (NIU, WHT fields)
   → status: validated

3. CFO APPROVAL
   Tina clicks "Send for validation"
   → Bundled: invoice PDF + payment line + SOA snapshot
   → Resend email to Enow with signed Approve/Reject URLs
   → Reminder at 7 days (per C7); escalate after 3 reminders
   → status: approved_by_cfo

4. SAGE EXPORT
   App generates .txt (one per entity if split)
   → Tina downloads → imports in Sage 100 Comptabilité
   → Tina confirms import in app
   → status: sage_imported

5. PAYMENT
   Bank (monthly): added to Supplier Payment Sheet batch
   Maviance (daily/weekly): added to wallet tracker
   → Christelle review → CFO physical sign (existing process)
   → status: payment_scheduled → paid

6. SYNC
   Supabase → Airtable (invoices, payments, exceptions)
   → Weekly report dashboard updated
   → Qwen can query current state
```

---

## 4. Email strategy (no M365 API)

| Direction | Method |
|-----------|--------|
| **Inbound** | Tina uploads in app (primary for demo). Optional: forward emails with attachments to `ap-intake@navari.systems` via Resend inbound parse |
| **Outbound approvals** | Resend from `ap-workflow@navari.systems` — signed action links. **Cannot send as randa@** without M365 SMTP/API |
| **Reminders** | Same Resend address; CC Tina on all CFO emails |
| **Vendor follow-up** | Template emails from workflow address; Tina reviews before send (or auto after 7 days for missing docs) |

**Note on D4 (send from Tina's email):** Not feasible without M365 Graph API or her SMTP credentials. Recommend: send from workflow address with footer *"On behalf of Tina-Randa, AP Accountant — randa@inteloutsourcingservices.com"*.

---

## 5. Airtable integration

### Synced bases

| Airtable table | Supabase source | Purpose |
|----------------|-----------------|---------|
| Invoices | `invoices` | Sortable inbox, filter by status/entity/supplier |
| Approvals | `approvals` | Pending CFO view, overdue highlighting |
| Payments — Bank | `payment_lines` (type=bank) | Monthly payment sheet mirror |
| Payments — Maviance | `payment_lines` (type=maviance) | Daily wallet tracker |
| Suppliers | `suppliers` | Master list with accreditation status |
| Intercompany splits | `intercompany_allocations` | Split grid per invoice |
| Exceptions | `exceptions` | Open issues tracker |
| Weekly KPIs | computed view | Auto-updated Monday dashboard |

### Sync mechanism

- **Supabase → Airtable:** Edge Function or API route on status change (webhook) + nightly full sync
- **Airtable → Supabase:** Read-only for demo; Tina edits in Next.js app (Airtable is view/report layer)

### Dashboards (Airtable Interfaces)

1. **AP Inbox** — all invoices by status, entity, aging
2. **CFO Queue** — pending approvals, days waiting
3. **Payment Calendar** — Wed cut-off / Fri execution tracker
4. **Weekly Report** — invoices processed, approved, paid, exceptions (matches Tina's Friday status report)
5. **Entity Portfolio** — spend by entity, supplier concentration

---

## 6. Qwen AI assistant

| Capability | Example prompt |
|------------|----------------|
| Status queries | "How many invoices are waiting for CFO approval?" |
| Follow-up drafts | "Draft a follow-up email to CAMTEL for missing delivery note" |
| Account code suggestion | "What GL account for software license from DevRev?" |
| Anomaly detection | "Flag invoices where VAT doesn't match 19.25% standard rate" |
| Weekly summary | "Summarise this week's AP activity for management report" |
| Intercompany check | "Does this split total match the invoice T.A.I?" |

**Implementation:** Qwen API called from Next.js API route; context = structured JSON from Supabase (never raw PDFs). RAG optional later.

---

## 7. API endpoints (updated)

### Core workflow

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/invoices/upload` | Upload PDF/scan; store + trigger OCR |
| `POST` | `/api/invoices/[id]/ocr` | Re-run extraction on scan |
| `PATCH` | `/api/invoices/[id]` | Edit extracted fields |
| `POST` | `/api/invoices/[id]/match-po` | Link PO + delivery note |
| `POST` | `/api/invoices/[id]/split` | Set intercompany allocation (7 columns) |
| `POST` | `/api/invoices/[id]/send-approval` | Email CFO bundle |
| `POST` | `/api/approvals/[id]/respond` | CFO approve/reject via signed URL |
| `GET` | `/api/approvals/pending` | Dashboard: awaiting CFO |

### Sage export

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/sage/generate/[invoiceId]` | Generate `.txt` for one invoice |
| `POST` | `/api/sage/generate-batch` | Batch `.txt` for period |
| `GET` | `/api/sage/download/[fileId]` | Download `.txt` or zip (multi-entity) |
| `POST` | `/api/sage/confirm-import/[fileId]` | Tina marks imported |
| `POST` | `/api/sage/upload-export` | Upload Sage export for recon |

### Payment sheets

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/payments/bank-sheet/[month]` | Download Supplier Payment Sheet `.xlsx` |
| `GET` | `/api/payments/maviance/[date]` | Download Maviance daily tracker `.xlsx` |
| `POST` | `/api/payments/maviance/line` | Add mobile payment line |
| `GET` | `/api/payments/queue` | Invoices ready for payment |

### Regional

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/cash-requests` | Submit regional cash request |
| `PATCH` | `/api/cash-requests/[id]/review` | Tina validates |

### Sync & AI

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/sync/airtable` | Push records to Airtable |
| `POST` | `/api/ai/chat` | Qwen assistant query |
| `GET` | `/api/reports/weekly` | Weekly AP status JSON + Airtable feed |

### Cron (pg_cron or Hostinger scheduler)

| Job | Schedule | Action |
|-----|----------|--------|
| Approval reminders | Daily 08:00 WAT | Send reminders for pending > 7 days |
| Escalation | Daily 08:00 WAT | Escalate after 3 reminders |
| Airtable sync | Daily 23:00 WAT | Full sync |
| Weekly report | Friday 16:00 WAT | Generate + email Tina |

---

## 8. Supabase schema (key tables)

```sql
-- entities (7 Sage companies)
entities (id, name, code, sage_folder, airtable_record_id)

-- invoices
invoices (
  id, entity_id, supplier_id, invoice_number, invoice_date,
  gross_amount, net_amount, vat_amount, wht_amount,
  status, po_id, delivery_note_id, ocr_json,
  is_intercompany, storage_path, created_at
)

-- intercompany_allocations
intercompany_allocations (
  id, invoice_id, entity_id, amount, gl_account
)

-- approvals
approvals (
  id, invoice_id, approver_email, approver_role,
  requested_at, responded_at, decision,
  reminder_count, last_reminder_at, token_hash
)

-- sage_exports
sage_exports (
  id, invoice_id, entity_id, journal_code,
  file_path, generated_at, imported_at, import_confirmed_by
)

-- payment_lines
payment_lines (
  id, invoice_id, payment_type, -- 'bank' | 'maviance'
  amount, scheduled_date, executed_date,
  cfo_approval, ceo_approval, receipt_ref
)

-- cash_requests
cash_requests (
  id, regional_office, period, amount_requested,
  amount_approved, justification_path, status
)
```

---

## 9. Build phases (demo-first)

### Phase 0 — Demo preview (2 weeks)

- [ ] Supabase project + schema
- [ ] Next.js app on Hostinger subdomain
- [ ] Invoice upload + mock OCR (or OpenAI Vision)
- [ ] Invoice list + detail + status timeline
- [ ] CFO approval email (Resend) + respond page
- [ ] Sage `.txt` generator (supplier invoice 3-line pattern)
- [ ] Download Supplier Payment Sheet `.xlsx` (January template)
- [ ] Seed data for all 7 entities

### Phase 1 — Tina pilot (weeks 3–4)

- [ ] Real OCR on scans/PDFs
- [ ] PO matching UI
- [ ] Intercompany split grid → multi-entity `.txt` zip
- [ ] Maviance daily sheet generator
- [ ] Approval reminders (7-day cron)
- [ ] Airtable sync + basic dashboard

### Phase 2 — Full workflow (weeks 5–8)

- [ ] Regional cash request intake
- [ ] Sage export upload → reconciliation
- [ ] Qwen AI assistant panel
- [ ] Weekly report automation
- [ ] Exception logging + escalation
- [ ] All 7 entities live

---

## 10. Tools & services checklist

| Service | Purpose | Setup needed |
|---------|---------|--------------|
| Supabase | DB, auth, storage | New project `intel-hrc-ap` |
| Hostinger Node | App hosting | Subdomain + env vars |
| Resend | Outbound email + inbound parse | Domain verify `navari.systems` or client subdomain |
| Airtable | Operational dashboards | Base + API key + sync mapping |
| Qwen API | AI assistant | API key (Alibaba Cloud or compatible provider) |
| OpenAI Vision | OCR (Phase 1) | Existing Navari key or Qwen-VL alternative |
| ExcelJS | `.xlsx` generation | NPM package |

---

## 11. Sage "boycott" strategy — confirmed

| System | Role |
|--------|------|
| **Our app (Supabase + Next.js + Airtable)** | Workflow system of record — tracking, approvals, documents, payment queues |
| **Sage 100 Comptabilité** | Accounting ledger of record — updated manually via `.txt` import |

We do **not** replace Sage for books. We replace Excel trackers, Outlook follow-ups, and manual `.txt` file preparation. Tina's interaction with Sage stays the same (import screen → Operation journal → 0 errors) — the app just produces the file correctly every time.

---

*Architecture v2 — incorporates Tina-Randa discovery responses and sample file analysis.*

# Intel HRC — Discovery Questionnaire for Tina-Randa

**Purpose:** Get the precise details needed to build your AP automation system.  
**Instructions:** Answer each question as specifically as possible. Screenshots, sample files, and examples are extremely helpful — attach or paste where indicated.

---

## Section A: Sage 100 Online — Import/Export

These questions define how we connect to Sage, which is the core of the entire system.

### A1. The .txt file format

1. **Can you send us 2–3 sample `.txt` files** — one you import INTO Sage and one you export FROM Sage? (Blank out sensitive amounts if needed, but keep the structure intact.)
2. What is the **column separator** in the `.txt` file? (Tab? Semicolon? Comma? Fixed-width?)
3. What **character encoding** does Sage 100 Online expect? (UTF-8? ANSI/Windows-1252? ISO-8859-1?)
4. Does the `.txt` file have a **header row** with column names, or is it just data rows?
5. List the **columns in order** for an AP import file. For example, is it something like:
   `Journal Code | Date | Account | Supplier Code | Label | Debit | Credit | Reference | …`
6. What **date format** does Sage expect? (`DD/MM/YYYY`? `YYYYMMDD`?)
7. Is there a **maximum line count** or **file size limit** per import?
8. When you import, does Sage give you **an error log or confirmation report**? If yes, what format?

### A2. Journal codes

9. List **every journal code** you use for AP work, and what each one means. For example:

   | Code | Meaning | Example use |
   |------|---------|-------------|
   | `ACH` | ? | ? |
   | `BQ` | ? | ? |
   | `OD` | ? | ? |
   | (add all yours) | | |

10. Do you use **different journal codes per entity** (e.g. `ACH-HRC` vs `ACH-IOS`), or is the entity distinguished by a different field in the file?
11. Are there journal codes you use for **intercompany entries** specifically?
12. When posting a **supplier invoice with VAT**, does it go in as **one line item or multiple** (e.g. gross + VAT separate)?

### A3. Sage 100 Online access

13. Do you access Sage 100 Online via a **web browser** or a **desktop app** (Citrix / remote desktop)?
14. Does Sage 100 Online have an **API** or any programmatic access, or is `.txt` import the only way in?
15. Is there a **Sage admin** or IT person at Intel HRC who manages the Sage instance?
16. Can you do the **import from any device**, or does it require a specific machine / VPN?
17. How do you **export** data from Sage? (Menu path? File → Export? A specific report?)
18. What exports do you pull regularly? (Trial balance, AP aging, supplier list, journal listing?)

---

## Section B: Your Current Daily Workflow — Step by Step

We need to understand exactly what you do today, manually, so we can automate it.

### B1. Invoice arrival

19. **Where do invoices arrive?** (Your personal Outlook inbox? A shared mailbox like `ap@intelhrc.org`? WhatsApp? Handed to you physically? A mix?)
20. Who sends them — **the supplier directly**, or does **HQC & CS** forward them to you?
21. What **formats** do invoices arrive in? (PDF attachment? Photo/scan? Excel? Paper only?)
22. When an invoice arrives by email, what does a **typical subject line** look like? Is there any pattern?
23. On average, how many **new invoices do you receive per day**? Per week? Per month?
24. How many **active suppliers** does Intel HRC deal with regularly?

### B2. Invoice validation

25. When you receive an invoice, what do you check **first**?
26. How do you find the **matching PO**? (Search in Sage? Check an Excel sheet? Ask someone?)
27. How do you confirm **delivery**? (Check for a signed delivery note? Email HQC & CS?)
28. What happens when there is **no PO** for an invoice? (Send it back? Ask the requestor? Post it anyway with a note?)
29. What is the **most common reason** an invoice gets stuck or delayed?
30. When an invoice fails validation, how do you **notify the supplier** and **track the issue**?

### B3. Posting to Sage

31. Walk us through **posting one invoice** into Sage. What do you click / type / select? (Screen-by-screen if possible.)
32. Do you batch multiple invoices into **one `.txt` file** or import them **one at a time**?
33. After importing, do you **review the posted entries** inside Sage, or do you trust the import?
34. How long does it take you to **prepare one `.txt` file** and import it?
35. Do you ever need to **reverse or correct** an imported entry? How do you do that today?

### B4. Payment preparation

36. When you prepare the **payment Excel sheet**, what columns does it have? (Can you send a blank template?)
37. Who do you send the payment sheet to, and in what order?
38. Does the CFO (Enow) **sign/approve on the Excel sheet** (e.g. add his initials), or does he reply by email?
39. After CFO approval, what happens next — do **you** send it to Treasury, or does the CFO forward it?
40. Do you track which invoices have been **paid vs pending** in Excel, in Sage, or both?

---

## Section C: Email Tracking & Follow-ups

This is the system you need most — tracking, chasing, and getting CFO validation.

### C1. Current state

41. How do you currently **track which invoices are pending approval**? (Excel list? Mental note? Outlook flags? Nothing formal?)
42. When you need the CFO to validate something, how do you send it? (Forward the invoice email? Compose a new email? Walk to his desk?)
43. How does the CFO **respond** to your validation requests? (Reply email with "approved"? Sign a physical document? Both?)
44. On average, how long does it take to get **CFO approval** from the time you send it? (Hours? Days? Weeks?)
45. What happens when the CFO doesn't respond? Do you **follow up**? How many times? After how long?
46. Have you ever **lost track** of an invoice that needed approval? What happened?

### C2. What you want

47. When an invoice needs CFO validation, what information should the **automated email** include? (Invoice PDF? Amount? Supplier? PO reference? Due date?)
48. Should the CFO be able to **approve by replying** to the email (e.g. reply "APPROVED"), or should he click a link/button?
49. If the CFO doesn't respond within X hours/days, should the system **automatically send a reminder**? After how long?
50. After how many reminders should the system **escalate** to someone else? Who?
51. Do you want a **dashboard** where you can see all pending approvals, or is email tracking enough?
52. Should the system track approvals for **other people too** (HFP&A, Head Tax/Payroll/AP, COO), or just CFO for now?

---

## Section D: Regional Offices & Entities

### D1. The 7 entities

53. List all **7 entity names** (e.g. INTEL HRC, IOS CMR, …). For each, tell us:
    - Does it have its own **Sage company file** or do all 7 share one?
    - Does it use the **same chart of accounts** as HQ?
    - Does it have a **different bank account**?

54. For the **6 regional offices** that send cash requests:
    - How do they send requests? (Email? Excel template? WhatsApp?)
    - What information does a cash request contain?
    - How do they send **justifications**? Same channel?
    - Can you send a **sample cash request** and a **sample justification**?

---

## Section E: Reconciliation & Month-End

55. For your **weekly AP sub-ledger to GL reconciliation**:
    - Do you export data from Sage and compare in Excel?
    - What's the typical **number of discrepancies** per week?
    - How long does it take if there are zero issues vs many issues?

56. For your **monthly AP aging report**:
    - Do you generate this inside Sage or build it in Excel from an export?
    - What aging buckets do you use? (0–30, 31–60, 61–90, 90+?)
    - Who receives this report?

57. For **intercompany reconciliation**:
    - How do you communicate with the other entities' accountants? (Email? Shared Excel? Calls?)
    - What is the most common intercompany discrepancy?

---

## Section F: Pain Points & Priorities

58. If you could **automate only one thing**, what would it be and why?
59. What task takes the **longest** but adds the **least value** (pure admin / data entry)?
60. What task are you **most worried about making mistakes** on?
61. Are there things you are **supposed to do per the SOP** but **don't have time for** in practice?
62. On a scale of 1–5, how comfortable are you with:
    - Using new software tools?
    - Receiving automated emails on your behalf?
    - Trusting a system to generate `.txt` files for Sage import?
63. Is there anything about your current workflow that **nobody has asked you about** but you wish they would?

---

## Section G: Technical Environment

64. What **email address** do you use for AP work? Is it personal (`tina@…`) or shared (`ap@…`)?
65. Do you have **Microsoft 365** (cloud Outlook) or on-premise Exchange?
66. Do you use **OneDrive / SharePoint** to store files, or local folders?
67. What **browser** do you use for Sage 100 Online?
68. Do you have **admin access** to install software on your computer, or does IT control that?
69. What is your **internet connection** like? Reliable or frequent disconnections?
70. Does Intel HRC have an **IT department or person** who could help with setup?

---

## Section H: Attachments requested

Please send the following files along with your answers. Rename them so we can match them:

| # | What we need | Filename to use |
|---|--------------|-----------------|
| 1 | Sample Sage `.txt` **import** file | `sample-sage-import.txt` |
| 2 | Sample Sage `.txt` **export** file | `sample-sage-export.txt` |
| 3 | Sample **supplier invoice** (PDF) | `sample-invoice.pdf` |
| 4 | Your **payment Excel sheet** (blank template) | `payment-sheet-template.xlsx` |
| 5 | Sample **cash request** from a regional office | `sample-cash-request.xlsx` |
| 6 | Sample **justification** from a regional office | `sample-justification.xlsx` |
| 7 | Screenshot of Sage 100 Online **import screen** | `sage-import-screen.png` |
| 8 | Screenshot of Sage 100 Online **export screen** | `sage-export-screen.png` |
| 9 | Your current **AP tracker** (if you have one) | `ap-tracker.xlsx` |

---

## How to respond

You can answer in any format — a Word document, typed replies in an email, voice notes, or even a screen recording walking through your day. Whatever is fastest for you.

**Send to:** Jesse (Navari Systems)  
**Deadline:** Before our first build sprint — the sooner we get this, the sooner we build.

---

*These questions are confidential and will only be used by Navari Systems to design Tina-Randa's AP automation workflow.*

# Sage 100 Comptabilité — `.txt` Import Format Spec

**Source:** Real import samples from Tina-Randa (Jun 2026)  
**Validated by:** A1–A8 + sample files  
**Entity reference:** [sage-entity-structure.md](./sage-entity-structure.md)  
**Encoding:** UTF-8 (confirm if accented labels fail on import)

---

## File rules

| Rule | Value |
|------|-------|
| Extension | `.txt` |
| Header row | **No** |
| Delimiter | Tab (`\t`) — 8 columns |
| Date format | `DD/MM/YYYY` |
| Amount format | Integer FCFA, no decimals |
| Batch | Multiple invoices/lines per file |
| Per entity | **One file per Sage company** → `g:\Sage\Companies\{FOLDER}` |
| Purchase journal | **`ACH`** (subsidiaries) / `PURC` or `ACH` (HQ) |

---

## Column specification (confirmed)

| Col | Field | Required | Example |
|-----|-------|----------|---------|
| 1 | Journal code | Yes | `ACH`, `OPD` |
| 2 | Date | Yes | `26/01/2026`, `19/05/2026` |
| 3 | Auxiliary (debit) | When Dr 401x / 4612 / expense+ref | `FR085`, `INC03` |
| 4 | GL account | Yes | `6324400`, `4011000`, `4612000` |
| 5 | Auxiliary (credit) | When Cr 401x | `FR0040`, `FR085` |
| 6 | Label | Yes | `CONSULTANCY FEE - MAY 2026 - Michael mazzone` |
| 7 | Debit | If debit line | `15932567` |
| 8 | Credit | If credit line | `12746054` |

**Auxiliary column usage (from real samples):**

- **Consultancy + WHT:** supplier aux (`FR085`) in **column 5 on all 3 lines**; column 3 empty
- **Intercompany split:** `INC03`–`INC08` in **column 5** on `4612000` lines; `FR0040` in column 5 on `4011000` credit
- **OPD prepaid:** both aux columns empty

---

## Pattern A: Supplier invoice — consultancy + WHT (ACH)

**Source:** `source/sample-sage-import-cons-civ-may26.txt`  
**Journal:** `ACH`  
**3 lines per invoice** — same supplier aux on every line:

```
ACH	19/05/2026		6324400	FR085	CONSULTANCY FEE - MAY 2026 - Michael mazzone	15932567	
ACH	19/05/2026		4472700	FR085	CONSULTANCY FEE - MAY 2026 - Michael mazzone		3186513
ACH	19/05/2026		4011000	FR085	CONSULTANCY FEE - MAY 2026 - Michael mazzone		12746054
```

| Line | Account | Col 5 aux | Side | Amount | Meaning |
|------|---------|-----------|------|--------|---------|
| 1 | `6324400` | `FR085` | Dr | 15932567 | Professional fees (gross) |
| 2 | `4472700` | `FR085` | Cr | 3186513 | Withholding tax (20%) |
| 3 | `4011000` | `FR085` | Cr | 12746054 | Net payable to supplier |

**Balance rule:** `gross = net_payable + wht` → `15932567 = 12746054 + 3186513`

Generator logic:
```typescript
const gross = invoice.grossAmount;
const wht = invoice.whtAmount; // or gross * rate
const net = gross - wht;
// Line 1: Dr 6324400, aux, gross
// Line 2: Cr 4472700, aux, wht  (note: credit column)
// Line 3: Cr 4011000, aux, net
```

---

## Pattern B: Intercompany split invoice (ACH)

**Source:** `source/sample-sage-import-fraxbit-civ.txt`  
**Journal:** `ACH`  
**1 expense + N interco debits + 1 supplier credit:**

```
ACH	26/01/2026		6324400		CT FRAXBIT - WEB DEVELOPMENT SERVICES 	131191	
ACH	26/01/2026		4612000	INC03	CT FRAXBIT - WEB DEVELOPMENT SERVICES 	131191	
ACH	26/01/2026		4612000	INC04	CT FRAXBIT - WEB DEVELOPMENT SERVICES 	131191	
… (INC05, INC06, INC07 …)
ACH	26/01/2026		4011000	FR0040	CT FRAXBIT - WEB DEVELOPMENT SERVICES 		918340
```

| Line | Account | Aux | Side | Meaning |
|------|---------|-----|------|---------|
| 1 | `6324400` | — | Dr | Contracting entity expense share |
| 2–N | `4612000` | `INC03`…`INC08` | Dr | Intercompany allocation to each entity |
| Last | `4011000` | `FR0040` | Cr | Total invoice payable to supplier |

**Balance rule:** Sum of all debits = supplier credit (`918340`)

Generator: use intercompany recons allocations → one `.txt` per contracting entity + interco lines with `4612000`/`INCxx`.

---

## Pattern C: Prepaid / accrual (OPD + 4761000)

**Source:** `source/sample-sage-import.txt`  
**Journal:** `OPD`  
**2 lines per item** — Dr expense, Cr prepaid suspense:

```
OPD	01/01/2026		6222100		SCI PLANET - Rent Yard Jan-26	1290000	
OPD	01/01/2026		4761000		SCI PLANET - Rent Yard Jan-26		1290000
```

No auxiliary on these lines.

---

## Pattern D: Supplier invoice with VAT (PURC — HQ)

**Source:** `source/sample-sage-export-vat-orange-hq.txt` (Sage Excel export — not import format)  
**Journal:** `PURC` (Intel HRC only; IOS subsidiaries use `ACH` with entity-specific VAT accounts)  
**3 lines per invoice:**

Original Sage export (10 columns, with header):

```
Day  Voucher  General account  BP account  Entry description              Debit   Credit
15   19       62811100                     FCT N°0026488593 - ORANGE - MAY  504654
15   19       44520000                     FCT N°0026488593 - ORANGE - MAY   97146
15   19       40100000         FR0001       FCT N°0026488593 - ORANGE - MAY          601800
```

Equivalent `.txt` import (8 columns, tab-separated):

```
PURC	15/05/2026		62811100		FCT N°0026488593 - ORANGE - MAY 	504654	
PURC	15/05/2026		44520000		FCT N°0026488593 - ORANGE - MAY 	97146	
PURC	15/05/2026		40100000	FR0001	FCT N°0026488593 - ORANGE - MAY 		601800
```

| Line | Account | Col 5 aux | Side | Amount | Meaning |
|------|---------|-----------|------|--------|---------|
| 1 | `62811100` | — | Dr | 504654 | Expense net (telecom) |
| 2 | `44520000` | — | Dr | 97146 | Recoverable VAT |
| 3 | `40100000` | `FR0001` | Cr | 601800 | Gross payable to ORANGE |

**Balance rule:** `net + vat = gross` → `504654 + 97146 = 601800`

**Note:** HQ uses **8-digit** GL accounts; supplier aux (`FR0001`) on **401 credit line only** (unlike CIV consultancy where aux is on all 3 lines).

Generator logic:
```typescript
const net = invoice.netAmount;
const vat = invoice.vatAmount;
const gross = net + vat;
const journal = entity.isHQ ? 'PURC' : 'ACH';
// Line 1: Dr expense account, net
// Line 2: Dr 445x (entity-specific VAT account), vat
// Line 3: Cr 401x, aux on col 5, gross
```

IOS subsidiary equivalent uses `ACH` journal and entity-specific account numbers from `sage-structure.xlsx`.

---

## Pattern E: Supplier payment

```
ACH	{DATE}		4011000	{FRxxx}	{SUPPLIER} - Payment {REF}	{GROSS}	
ACH	{DATE}		5121		{SUPPLIER} - Payment {REF}		{GROSS}
```

---

## Journal codes by entity

| Entity | Purchase | Cash | General |
|--------|----------|------|---------|
| INTEL HRC | **`PURC`** | `CAS2` | `OPDC` |
| IOS CMR | **`ACH`** | — | `OPD` |
| IOS CIV | **`ACH`** | `CAS` | `OD` |
| IOS BF | **`ACH`** | `CAI` | `OD` |
| IOS SEN | **`ACH`** | `CAIS` | `OD` |
| IOS RDC | **`ACH`** | `CAI` | `OPD` |
| IOS NIGER | **`ACH`** | `CAI` | `OD` |
| IOS MALI | **`ACH`** | `CASH` | `OPD` |

**Rule:** Intel HRC = `PURC`; all IOS = `ACH`.

Full supplier aux + chart: `source/sage-structure.xlsx`

---

## Generator output

1. Tina validates invoice → **Generate Sage import**
2. App selects pattern (A/B/C/D) based on invoice type
3. Output: `UPLOAD {SUPPLIER}-{PERIOD} - {ENTITY}.txt`
4. Tina imports → Operation journal = 0 errors
5. Tina marks **Imported** in app

Intercompany: zip with one `.txt` per affected entity folder.

---

## TypeScript interface

```typescript
interface SageTxtLine {
  journalCode: string;       // ACH, OPD, etc.
  date: string;             // DD/MM/YYYY
  auxiliaryDebit?: string;  // FR085, INC03
  account: string;          // 6324400, 4011000
  auxiliaryCredit?: string;  // FR0040 on Cr 4011
  label: string;
  debit?: number;
  credit?: number;
}

function generateConsultancyWithWHT(invoice: Invoice): SageTxtLine[];
function generateSupplierInvoiceWithVAT(invoice: Invoice): SageTxtLine[];
function generateIntercompanySplit(invoice: Invoice, splits: EntitySplit[]): SageTxtLine[];
function getPurchaseJournal(entity: Entity): 'PURC' | 'ACH';
function generatePrepaidAccrual(entry: AccrualEntry): SageTxtLine[];
function toSageTxt(lines: SageTxtLine[]): string;
```

---

## Validation before download

| Check | Action |
|-------|--------|
| Debits = Credits per entry group | Block if unbalanced |
| WHT: gross = net + wht | Block on consultancy pattern |
| VAT: net + vat = gross | Block on VAT pattern |
| Interco: Σ debits = supplier credit | Block |
| Supplier aux exists in entity master | Warn if unknown |
| Account exists in entity chart | Warn if unknown |
| Journal code valid for entity | Block |
| Intercompany splits sum to T.A.I | Block |

---

## Sample files

| File | Pattern |
|------|---------|
| `sample-sage-import.txt` | C — OPD prepaid |
| `sample-sage-import-cons-civ-may26.txt` | A — ACH consultancy + WHT |
| `sample-sage-import-fraxbit-civ.txt` | B — ACH intercompany split |
| `sample-sage-export-vat-orange-hq.txt` | D — PURC goods + VAT (HQ, Sage export) |
| `sage-company-folders.txt` | All 8 Sage folder names |
| `sage-structure.xlsx` | Master data all entities |
| `revised-syscohada-accounting-plan.pdf` | SYSCOHADA chart reference |

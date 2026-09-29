# Getting Accurate Finance Data Out of MYOB Exo

A plain-English guide for the exec team and whoever manages your Exo server (internal IT or your MYOB partner).
The aim is to feed a live finance dashboard (hourly/daily) from Exo, with numbers that tie back to Exo's own reports.

---

## 1. The short version

1. **Exo is a Microsoft SQL Server database.** The most complete and reliable way to get data out is a **read-only SQL login** to that database (or to a copy of it).
2. **Don't query production directly for "live" refreshes.** Point the dashboard at a **read replica** or a **reporting database** that refreshes every 5–15 minutes.
3. **Pull incrementally**: only rows that changed since the last run. That's what makes hourly data practical.
4. **Reconcile every load against Exo's own totals** (Trial Balance, Debtors/Creditors aged balances, stock valuation). If the dashboard doesn't tie out, it doesn't go live.
5. **Spreadsheets become inputs, not reports.** Budgets, forecasts and manual adjustments go into a fixed template (`templates/budget_template.csv`) that gets loaded alongside Exo data.

---

## 2. Your options for getting data out of Exo

| Option | How live | Completeness | Effort | Recommended? |
|---|---|---|---|---|
| **A. Read-only SQL access** to the Exo database (or a replica) | Near real-time (minutes) | Everything: every ledger, every transaction | Low–medium | **Yes – primary route** |
| **B. MYOB Exo API** (REST, runs on your Exo server via IIS) | Near real-time | Good for customers, stock, orders; weaker for GL/reporting | Medium (needs an MYOB developer key + API config) | Only if SQL access is refused (e.g. hosted setup) |
| **C. Exo Clarity reports / scheduled exports to CSV/Excel** | Daily at best | Only what the report contains | Low | Stop-gap only |
| **D. Manual spreadsheet exports** | Whenever someone remembers | Error-prone | Ongoing manual effort | No – this is what we're replacing |

**Recommendation: Option A**, set up as below.

### Recommended setup (Option A)

```
┌──────────────────┐   read-only   ┌───────────────────────┐   every 5–15 min   ┌───────────────┐    ┌───────────┐
│ Exo production DB │ ────────────▶ │ Read replica / reporting│ ────────────────▶ │ Finance data   │ ─▶ │ Dashboard │
│ (SQL Server)      │  replication  │ DB (same or other server)│  incremental pull │ store (clean)  │    │           │
└──────────────────┘               └───────────────────────┘                    └───────────────┘    └───────────┘
                                                                        ▲
                                                 Budgets / forecasts ───┘ (templates/budget_template.csv)
```

Ask IT / your MYOB partner for the following (you can forward this list as-is):

1. **Confirm where Exo's SQL Server lives**: on-premise server, Azure/AWS VM, or partner-hosted. Also the **Exo version** (Help → About) and **SQL Server version**.
2. **Create a read-only SQL login** (e.g. `naer_reporting`) with `db_datareader` on the Exo database only. No write permissions, no `sysadmin`.
3. **Preferably, give that login access to a copy, not production**:
   - SQL Server **Always On readable secondary**, **transactional replication**, or **log shipping** (standby/read-only mode) – any of these gives a copy that's seconds-to-minutes behind production.
   - At minimum, a **nightly restored backup** to a reporting DB for the daily views, with hourly queries against production kept small and incremental.
4. **Do not create views or tables inside the Exo database itself.** Exo upgrades can overwrite or break them. Put any reporting views in a **separate database on the same server** that references Exo with three-part names (`ExoDB.dbo.DR_TRANS`).
5. **Network access**: a secure route from wherever the dashboard's data loader runs to the SQL Server (VPN, private network, or an on-premise gateway such as the Power BI gateway). **Never expose SQL Server port 1433 to the internet.**
6. **Confirm how and when sub-ledgers post to the General Ledger** (see §4.3). This matters for how "live" your P&L is.

If Exo is **hosted by a partner who won't grant SQL access**, fall back to Option B (the Exo API) and ask the partner to enable it and issue an API key.

---

## 3. What data the dashboard needs, and where it lives in Exo

Exo's core tables (names are standard across recent Exo Business versions but **always confirm against your database** using `sql/00_schema_discovery.sql`):

| Dashboard metric | Exo source table(s) | Notes |
|---|---|---|
| Sales invoiced today / this hour / MTD / YTD | `DR_TRANS` (invoices & credit notes), `DR_INVLINES` (line detail) | Filter by transaction type. Use ex-GST amounts. |
| Gross margin by product / customer / rep | `DR_INVLINES` (qty, sell price, cost), `STOCK_ITEMS` | Check which cost field your business uses (average vs standard). |
| Orders booked & order backlog | `SALESORD_HDR`, `SALESORD_LINES` | Backlog = ordered − supplied/invoiced, on open orders. |
| Cash received today | `DR_TRANS` (payments/receipts) and bank GL accounts in `GLTRANS` | |
| Bank / cash position | `GLTRANS` on bank GL accounts (and bank rec, if used) | Ties to GL, the source of truth for cash. |
| Debtors (AR) aged balances, DSO, overdue | `DR_ACCS` (`BALANCE`, `AGEDBAL0..3`), `DR_TRANS` (open items) | Must tie to the Debtors Control GL account. |
| Creditors (AP) due this week/month | `CR_ACCS`, `CR_TRANS` | Must tie to the Creditors Control GL account. |
| P&L (revenue, COGS, opex, EBITDA) vs budget vs last year | `GLTRANS`, `GLACCS` (+ your budget template) | Map GL accounts to P&L lines once, maintain the mapping. |
| Balance sheet / working capital | `GLTRANS`, `GLACCS` | |
| Stock on hand & value | `STOCK_ITEMS`, `STOCK_LOC_INFO`, `STOCK_TRANS` | Ties to the Stock GL account. |
| Purchases committed | `PURCHORD_HDR`, `PURCHORD_LINES` | |
| Accounting periods | `PERIOD_STATUS` | Exo transactions carry a `PERIOD_SEQNO`, which is key for month-end figures. |
| Customers, suppliers, reps, branches | `DR_ACCS`, `CR_ACCS`, `STAFF`, `BRANCHES` | Dimensions for slicing. |

Starter queries for each of these are in `sql/`.

---

## 4. Accuracy: the traps that make Exo dashboards wrong

These are the usual reasons a dashboard "doesn't match Exo". Decide each one **up front** and write the decision down.

### 4.1 Transaction dates vs accounting periods
Every Exo transaction has a **transaction date** (`TRANSDATE`) *and* an **accounting period** (`PERIOD_SEQNO`). They can differ, e.g. an invoice dated 2 July posted into June because June was still open.
- **Daily/hourly views** use transaction date or entry time.
- **Monthly P&L / "MTD vs budget"** uses period, so it agrees with Exo's financial reports.
- Show which one each tile uses.

### 4.2 GST / tax
Debtor/creditor transaction `AMOUNT` is normally **GST-inclusive**; `SUBTOTAL` / line values are typically **ex-GST**. **Revenue on the dashboard must be ex-GST.** Confirm against a known invoice.

### 4.3 Sub-ledger vs General Ledger timing
Debtors, Creditors and Stock are updated **instantly**. The GL is updated when those transactions are **posted to the GL** (immediately or in batches, depending on your Exo configuration).
- For **intraday** sales/cash tiles: read the sub-ledgers (`DR_TRANS`, `DR_INVLINES`).
- For **P&L and balance sheet**: read the GL (`GLTRANS`).
- Show a "GL last posted" timestamp on the dashboard so nobody is surprised.

### 4.4 Transaction type codes
`DR_TRANS` and `CR_TRANS` store invoices, credit notes, payments and adjustments together, distinguished by a `TRANSTYPE` code. **Do not assume the codes.** Run the discovery query (`sql/00_schema_discovery.sql`, section 3), then check a few of each type against the Exo screens and record the mapping in `sql/01_sales_invoices.sql`.

### 4.5 Foreign currency
If you trade in more than one currency, transaction amounts may be in the **foreign currency**, with an exchange rate on the row. Convert to base currency (NZD/AUD) consistently: use the GL (already base currency) for financials, and convert sub-ledger amounts using the stored rate.

### 4.6 Credit notes, reversals and deleted/void items
Credit notes must **reduce** sales. Reversed journals appear as two rows. Include both sides, don't filter "negative" rows out.

### 4.7 Costs and margin
Margin depends on which cost Exo records on the invoice line (average, standard or latest cost at time of sale). Use the **cost stored on the invoice line**, not today's cost from `STOCK_ITEMS`, or historical margins will drift.

### 4.8 Branches, companies and intercompany
If you run multiple Exo companies (separate databases) or branches, decide whether the dashboard shows consolidated figures, and exclude intercompany sales from group revenue.

### 4.9 Time zones
Exo stores local server time. If the dashboard or data store runs in the cloud (UTC), convert, or "today's sales" will be wrong in the morning.

---

## 5. Reconciliation: how we prove the numbers are right

Every data load runs the checks in `sql/10_reconciliation_checks.sql`. The dashboard shows a green/red "Data reconciled" badge. **If a check fails, the dashboard flags it rather than silently showing wrong numbers.**

| Check | Dashboard figure | Must equal (Exo report) |
|---|---|---|
| Debtors | Sum of customer balances (`DR_ACCS.BALANCE`) | Debtors Control GL account balance and the Exo **Aged Debtors** report total |
| Creditors | Sum of supplier balances (`CR_ACCS.BALANCE`) | Creditors Control GL account and **Aged Creditors** report |
| GL balances | Sum of `GLTRANS` by account | Exo **Trial Balance** (and TB nets to zero) |
| Sales | Sum of invoice lines for the period, ex-GST | Sales GL accounts for the same period, and Exo **Sales Analysis** report |
| Stock | Qty × cost across locations | Stock-on-hand GL account and Exo **Stock Valuation** report |
| Completeness | Row counts / max `SEQNO` in our store | Same in Exo (nothing missed between loads) |

**Go-live sign-off:** the finance team picks **one closed month**. Dashboard figures must match Exo's reports **to the cent** for that month before we switch the dashboard on. Then repeat for the current open month.

---

## 6. How "live" is possible, and how to do it safely

| Refresh | Approach |
|---|---|
| **Every 5–15 minutes** (intraday sales, orders, cash receipts) | Incremental pull: `WHERE SEQNO > last_seen_seqno` for new transactions, plus a `LAST_UPDATED > last_run_time` pull where the table has that column (confirm with the discovery script) to catch edits. |
| **Hourly** | Re-pull open items (unallocated invoices, open sales orders) since they change state. |
| **Nightly** | Full refresh of reference tables (customers, stock, GL accounts), full reconciliation run, and a rolling re-pull of the last 60–90 days to catch back-dated entries. |
| **Month-end** | Re-pull the closed period after close and snapshot it. |

Keep the incremental queries small (indexed on `SEQNO`) so they don't slow Exo down for staff.

---

## 7. What to send me next

To build the dashboard, please provide, **with customer/supplier names anonymised or on a private data connection, and not committed to this repository**:

1. **Output of `sql/00_schema_discovery.sql`**: table/column list, transaction type codes, date range. It contains no financial values.
2. **Your chart of accounts** (`GLACCS` export) and how GL accounts roll up into your P&L / balance sheet lines (your management accounts spreadsheet usually defines this).
3. **The spreadsheets you currently use** to report, so the dashboard reproduces the numbers the exec team already trusts.
4. **Budget/forecast** in the `templates/budget_template.csv` format (one row per period × GL account).
5. **Your top 10 questions** the dashboard must answer each morning (e.g. "Are we ahead of budget MTD?", "How much cash will we have on Friday?").
6. **One month of Exo reports** (Trial Balance, Aged Debtors, Aged Creditors, Sales Analysis) to reconcile against.

> ⚠️ **Data security:** finance data includes customer names, balances and bank details. Don't upload raw exports to GitHub, even a private repo. `.gitignore` already excludes `data/`, `.csv` and `.xlsx`. For the real build, the dashboard should connect to the reporting database through a secure connection, not to files.

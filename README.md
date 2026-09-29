# Naer – Finance Dashboard

Live (hourly/daily) executive finance dashboard sourced from MYOB Exo, replacing spreadsheet reporting.

## Start here
- **[docs/myob-exo-data-extraction-guide.md](docs/myob-exo-data-extraction-guide.md)**: how to get accurate data out of MYOB Exo, what to ask IT/your MYOB partner for, and how the numbers are reconciled.

## Layout
| Path | Purpose |
|---|---|
| `sql/00_schema_discovery.sql` | Run first. Confirms table/column names and transaction codes for your Exo version (returns no financial values). |
| `sql/01`–`05_*.sql` | Starter extraction queries: sales, receipts/AR, payables, GL, orders & stock. |
| `sql/10_reconciliation_checks.sql` | Checks that must equal zero before the dashboard shows data as reconciled. |
| `templates/budget_template.csv` | Format for budgets/forecasts currently held in spreadsheets. |

> Raw finance data is **never** committed. `data/`, `*.csv` and `*.xlsx` are git-ignored.

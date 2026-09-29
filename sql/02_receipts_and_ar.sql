/* =====================================================================
   Debtors: open items, receipts and aged balances
   ===================================================================== */
DECLARE @payment_type INT = 4;   -- VERIFY from 00_schema_discovery.sql

-- 2a. Customer receipts (cash in) – incremental on SEQNO
SELECT  SEQNO, ACCNO, TRANSDATE, PERIOD_SEQNO, AMOUNT, CURRENCYNO, EXCHRATE, REF1, BRANCHNO
FROM    DR_TRANS
WHERE   TRANSTYPE = @payment_type
  AND   SEQNO > 0 /* @last_seqno */;

-- 2b. Open (unallocated) debtor items – full re-pull hourly
SELECT  SEQNO, ACCNO, TRANSTYPE, INVNO, TRANSDATE, DUEDATE, AMOUNT, ALLOCATEDBAL,
        AMOUNT - ALLOCATEDBAL AS outstanding,
        DATEDIFF(DAY, DUEDATE, CAST(GETDATE() AS DATE)) AS days_overdue
FROM    DR_TRANS
WHERE   AMOUNT - ALLOCATEDBAL <> 0;

-- 2c. Aged balances per customer, as Exo holds them (ties to Aged Debtors report)
SELECT  ACCNO, NAME, BALANCE, AGEDBAL0 AS current_bal, AGEDBAL1 AS days_30,
        AGEDBAL2 AS days_60, AGEDBAL3 AS days_90_plus, CREDITLIMIT, SALESNO
FROM    DR_ACCS
WHERE   BALANCE <> 0;

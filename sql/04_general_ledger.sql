/* =====================================================================
   General Ledger – source of truth for P&L, balance sheet and cash
   ===================================================================== */

-- 4a. Chart of accounts (full refresh nightly). Map ACCNO -> P&L / BS line in the data store.
SELECT * FROM GLACCS;

-- 4b. GL transactions – incremental on SEQNO; nightly re-pull last 90 days for back-dated edits
SELECT  SEQNO, ACCNO, SUBACCNO, BRANCHNO, TRANSDATE, PERIOD_SEQNO,
        AMOUNT, REFERENCE, DETAILS, BATCHNO, SOURCE      -- VERIFY column names
FROM    GLTRANS
WHERE   SEQNO > 0 /* @last_seqno */;

-- 4c. Balances by account and period (monthly P&L / TB)
SELECT  ACCNO, SUBACCNO, PERIOD_SEQNO, SUM(AMOUNT) AS period_movement
FROM    GLTRANS
GROUP BY ACCNO, SUBACCNO, PERIOD_SEQNO;

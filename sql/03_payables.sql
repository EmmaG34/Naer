/* =====================================================================
   Creditors: open bills and aged balances (cash out forecast)
   ===================================================================== */
SELECT  SEQNO, ACCNO, TRANSTYPE, INVNO, TRANSDATE, DUEDATE, AMOUNT, ALLOCATEDBAL,
        AMOUNT - ALLOCATEDBAL AS outstanding
FROM    CR_TRANS
WHERE   AMOUNT - ALLOCATEDBAL <> 0;

SELECT  ACCNO, NAME, BALANCE, AGEDBAL0 AS current_bal, AGEDBAL1 AS days_30,
        AGEDBAL2 AS days_60, AGEDBAL3 AS days_90_plus
FROM    CR_ACCS
WHERE   BALANCE <> 0;

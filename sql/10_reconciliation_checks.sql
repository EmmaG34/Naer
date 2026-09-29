/* =====================================================================
   Reconciliation checks – run after every load.
   Each check returns a difference; anything other than 0.00 = RED on dashboard.
   Fill in your control account numbers.
   ===================================================================== */
DECLARE @debtors_control_gl   INT = 0;  -- SET: Debtors Control GL ACCNO
DECLARE @creditors_control_gl INT = 0;  -- SET: Creditors Control GL ACCNO

-- R1. Debtors ledger vs GL control account
SELECT 'Debtors vs GL' AS check_name,
       (SELECT SUM(BALANCE) FROM DR_ACCS) AS subledger,
       (SELECT SUM(AMOUNT) FROM GLTRANS WHERE ACCNO = @debtors_control_gl) AS gl,
       (SELECT SUM(BALANCE) FROM DR_ACCS)
     - (SELECT SUM(AMOUNT) FROM GLTRANS WHERE ACCNO = @debtors_control_gl) AS difference;

-- R2. Creditors ledger vs GL control account (sign convention: creditors are credits in GL)
SELECT 'Creditors vs GL' AS check_name,
       (SELECT SUM(BALANCE) FROM CR_ACCS) AS subledger,
       -(SELECT SUM(AMOUNT) FROM GLTRANS WHERE ACCNO = @creditors_control_gl) AS gl,
       (SELECT SUM(BALANCE) FROM CR_ACCS)
     + (SELECT SUM(AMOUNT) FROM GLTRANS WHERE ACCNO = @creditors_control_gl) AS difference;

-- R3. Trial balance nets to zero
SELECT 'Trial balance = 0' AS check_name, SUM(AMOUNT) AS difference FROM GLTRANS;

-- R4. Debtor aged buckets add up to balance
SELECT 'Aged buckets = balance' AS check_name,
       SUM(BALANCE - (AGEDBAL0 + AGEDBAL1 + AGEDBAL2 + AGEDBAL3)) AS difference
FROM   DR_ACCS;

-- R5. Completeness: compare with the same figures in the dashboard data store
SELECT 'DR_TRANS' AS tbl, COUNT(*) AS rows_in_exo, MAX(SEQNO) AS max_seqno FROM DR_TRANS
UNION ALL SELECT 'GLTRANS', COUNT(*), MAX(SEQNO) FROM GLTRANS
UNION ALL SELECT 'CR_TRANS', COUNT(*), MAX(SEQNO) FROM CR_TRANS;

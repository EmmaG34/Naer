/* =====================================================================
   Sales invoices & credit notes – line level, ex-GST
   Feeds: sales today / this hour / MTD / YTD, margin, by customer/rep/product.
   Incremental: pass @last_seqno (highest DR_TRANS.SEQNO already loaded).

   VERIFY before use (from 00_schema_discovery.sql):
     - TRANSTYPE codes for invoice and credit note in YOUR database
     - line value / cost column names on DR_INVLINES for your Exo version
   ===================================================================== */
DECLARE @last_seqno  INT = 0;
DECLARE @invoice_type INT = 1;   -- VERIFY
DECLARE @credit_type  INT = 2;   -- VERIFY (may be the same type with negative values)

SELECT  h.SEQNO            AS trans_seqno,
        h.TRANSTYPE        AS trans_type,
        h.INVNO            AS invoice_no,
        h.TRANSDATE        AS trans_date,
        h.PERIOD_SEQNO     AS period_seqno,
        h.ACCNO            AS customer_accno,
        h.SALESNO          AS rep_no,
        h.BRANCHNO         AS branch_no,
        h.CURRENCYNO       AS currency_no,
        h.EXCHRATE         AS exch_rate,
        l.SEQNO            AS line_seqno,
        l.STOCKCODE        AS stock_code,
        l.QUANTITY         AS quantity,
        l.UNITPRICE        AS unit_price_ex_gst,   -- VERIFY ex/inc GST
        l.DISCOUNT         AS discount_pct,
        l.LINETOTAL        AS line_total_ex_gst,   -- VERIFY column name
        l.UNITCOST         AS unit_cost_at_sale    -- VERIFY column name
FROM    DR_TRANS h
JOIN    DR_INVLINES l ON l.HDR_SEQNO = h.SEQNO
WHERE   h.TRANSTYPE IN (@invoice_type, @credit_type)
  AND   h.SEQNO > @last_seqno
ORDER BY h.SEQNO, l.SEQNO;

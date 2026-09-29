/* =====================================================================
   Sales order backlog and stock on hand
   ===================================================================== */

-- 5a. Open sales order lines (backlog) – VERIFY status codes and qty column names
SELECT  h.SEQNO AS order_seqno, h.ACCNO, h.ORDERDATE, h.DUEDATE, h.STATUS, h.SALESNO, h.BRANCHNO,
        l.STOCKCODE, l.ORD_QUANT, l.SUP_QUANT, l.INVQUANT,
        l.UNITPRICE, (l.ORD_QUANT - l.INVQUANT) * l.UNITPRICE AS open_value_ex_gst
FROM    SALESORD_HDR h
JOIN    SALESORD_LINES l ON l.HDR_SEQNO = h.SEQNO
WHERE   l.ORD_QUANT - l.INVQUANT <> 0;

-- 5b. Stock on hand and value by location
SELECT  s.STOCKCODE, s.DESCRIPTION, s.STOCKGROUP, i.LOCATION, i.QTY,
        s.AVECOST, i.QTY * s.AVECOST AS value_at_avg_cost
FROM    STOCK_ITEMS s
JOIN    STOCK_LOC_INFO i ON i.STOCKCODE = s.STOCKCODE
WHERE   i.QTY <> 0;

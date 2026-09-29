/* =====================================================================
   MYOB Exo – schema discovery (READ-ONLY, returns NO financial values)
   Run this first, against the Exo database, with the read-only login.
   Send the results back so the extraction queries can be locked to
   your exact Exo version.
   ===================================================================== */

-- 1. Exo / SQL Server version
SELECT @@VERSION AS sql_server_version, DB_NAME() AS exo_database;

-- 2. Columns of the tables the dashboard uses
SELECT  c.TABLE_NAME, c.COLUMN_NAME, c.DATA_TYPE, c.ORDINAL_POSITION
FROM    INFORMATION_SCHEMA.COLUMNS c
WHERE   c.TABLE_NAME IN (
          'DR_ACCS','DR_TRANS','DR_INVLINES',
          'CR_ACCS','CR_TRANS','CR_INVLINES',
          'GLACCS','GLTRANS','PERIOD_STATUS',
          'SALESORD_HDR','SALESORD_LINES',
          'PURCHORD_HDR','PURCHORD_LINES',
          'STOCK_ITEMS','STOCK_LOC_INFO','STOCK_TRANS',
          'STAFF','BRANCHES','CURRENCIES')
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;

-- 3. Transaction type codes in use (map these to Invoice / Credit / Payment / Adjustment
--    by opening a sample of each in Exo)
SELECT 'DR_TRANS' AS source, TRANSTYPE, COUNT(*) AS row_count,
       MIN(TRANSDATE) AS first_date, MAX(TRANSDATE) AS last_date,
       MIN(SEQNO) AS sample_seqno
FROM   DR_TRANS GROUP BY TRANSTYPE
UNION ALL
SELECT 'CR_TRANS', TRANSTYPE, COUNT(*), MIN(TRANSDATE), MAX(TRANSDATE), MIN(SEQNO)
FROM   CR_TRANS GROUP BY TRANSTYPE
ORDER BY source, TRANSTYPE;

-- 4. Which tables have a LAST_UPDATED column (enables change tracking for hourly loads)
SELECT TABLE_NAME
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  COLUMN_NAME = 'LAST_UPDATED'
ORDER BY TABLE_NAME;

-- 5. Row counts (sizing the initial load)
SELECT t.name AS table_name, SUM(p.rows) AS row_count
FROM   sys.tables t JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0,1)
WHERE  t.name IN ('DR_TRANS','DR_INVLINES','CR_TRANS','GLTRANS','STOCK_TRANS','SALESORD_HDR','SALESORD_LINES')
GROUP BY t.name ORDER BY t.name;

-- 6. Accounting periods (structure only)
SELECT TOP 50 * FROM PERIOD_STATUS ORDER BY SEQNO DESC;

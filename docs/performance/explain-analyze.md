# Database Performance: EXPLAIN ANALYZE

## 1. Overview
As part of Milestone 2 (Performance Tuning), we seeded the `restaurants` table with **100,000** records to test the efficiency of the `pg_trgm` extension combined with a GIN index for fuzzy text search.

## 2. Test Setup
- **Table:** `restaurants` (100,000 rows)
- **Index:** `CREATE INDEX idx_restaurants_name_trgm ON restaurants USING gin(name gin_trgm_ops);`
- **Query:** `SELECT * FROM restaurants WHERE name ILIKE '%Burger%';`

## 3. Results

```text
                                                                 QUERY PLAN                                                                 
--------------------------------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on restaurants  (cost=240.22..2158.00 rows=22222 width=1233) (actual time=3.202..15.912 rows=16811 loops=1)
   Recheck Cond: ((name)::text ~~* '%Burger%'::text)
   Heap Blocks: exact=1640
   ->  Bitmap Index Scan on idx_restaurants_name_trgm  (cost=0.00..234.67 rows=22222 width=0) (actual time=2.745..2.746 rows=16811 loops=1)
         Index Cond: ((name)::text ~~* '%Burger%'::text)
 Planning Time: 2.467 ms
 Execution Time: 17.171 ms
(7 rows)
```

## 4. Analysis
- **Execution Time:** ~17ms to find 16,811 matching rows out of 100,000.
- **Scan Type:** `Bitmap Index Scan` on `idx_restaurants_name_trgm`. The database successfully utilized the GIN index instead of falling back to an expensive `Seq Scan` (Sequential Scan).
- **Conclusion:** The `pg_trgm` implementation meets the high-performance search requirements for the FoodieGo platform.

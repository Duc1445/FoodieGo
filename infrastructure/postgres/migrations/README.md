# Database Migrations

This directory contains SQL migration files for the FoodieGo database.

## Running Migrations

### Automatic (Docker Compose)

Migrations run automatically when you start the stack with Docker Compose:

```bash
docker-compose up
```

The `migration-runner` service will execute all pending migrations after PostgreSQL is healthy.

### Manual (Local Development)

If you need to run migrations manually (e.g., when developing locally without Docker):

```bash
cd infrastructure/postgres/migrations
node migrate.js
```

Make sure you have the `DATABASE_URL` environment variable set, or it will default to:
```
postgresql://postgres:postgres@localhost:5432/foodiego
```

## Migration Files

Migrations are executed in alphabetical order. Each migration file should:

1. Be named with a numeric prefix (e.g., `001_`, `002_`, etc.)
2. Contain idempotent SQL (use `IF NOT EXISTS` where possible)
3. Include both `UP` and `DOWN` migrations in a single file (for rollback support)

## Migration Tracking

The `migrations` table tracks which migrations have been executed:

```sql
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Current Migrations

- `001_*.sql` - Initial schema setup
- `002_*.sql` - Sprint 2 features
- `003_*.sql` - Sprint 3 merchant portal
- `004_*.sql` - Admin and shipper features
- `005_*.sql` - Architecture hardening
- `006_*.sql` - Payment and refund idempotency
- `007_*.sql` - Payment gateway sequence
- `008_*.sql` - Inbox pattern
- `009_reviews.sql` - Review and rating system
- `010_promotions.sql` - Voucher and promotion system

## Adding New Migrations

1. Create a new SQL file with the next sequential number
2. Write your migration SQL
3. Test locally with `node migrate.js`
4. Commit to the repository
5. Migrations will run automatically on next `docker-compose up`

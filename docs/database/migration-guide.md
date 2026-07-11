# Migration Guide

## 1. Workflow
- Always use a migration tool (e.g., Prisma, TypeORM, or Knex) to manage schema changes.
- Never manually alter the database schema in production.
- Migration files must be committed to version control.

## 2. Rollback Strategy
- Every `up` migration must have a corresponding `down` rollback script.
- Test both `up` and `down` paths locally before merging.

## 3. Execution
- CI/CD will run `migrate status` and `migrate up` during deployment.

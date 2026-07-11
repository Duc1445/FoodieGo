# Seed Data Strategy

## 1. Purpose
Seed scripts provide essential baseline data (e.g., default admin roles, lookup tables) and dummy data for local development.

## 2. Rules
- **Idempotency**: Seed scripts must be rerunnable without duplicating data or crashing.
- **Separation**: Separate `production-seeds` (essential lookup data) from `development-seeds` (fake users, fake orders).
- Never seed development data into a production environment.

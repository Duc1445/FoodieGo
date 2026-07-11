# Environment Governance

## 1. Core Rule
**NO SECRETS COMMITTED TO GIT.** This includes database passwords, JWT secrets, Stripe keys, and third-party API tokens.

## 2. .env.example Requirement
Every service in `apps/*` MUST have an `.env.example` file containing all required environment variables with blank or dummy values.
Developers will copy this to `.env` locally.

## 3. Environment Separation
- **Local**: Uses local `.env` and `docker-compose.yml` (for Postgres, Redis, RabbitMQ).
- **Staging/CI**: Managed via GitHub Secrets or CI environment variables.
- **Production**: Managed securely via PaaS configuration (e.g., AWS Secrets Manager, Vercel Env Vars).

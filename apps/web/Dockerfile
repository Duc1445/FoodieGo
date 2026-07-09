# Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ui/package.json packages/ui/
COPY packages/api-sdk/package.json packages/api-sdk/
COPY apps/web/package.json apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ui packages/ui/
COPY packages/api-sdk packages/api-sdk/
COPY apps/web apps/web/

# Build
WORKDIR /app/apps/web
RUN pnpm run build

# Production Server (Nginx)
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

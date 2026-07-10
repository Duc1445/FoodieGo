# Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
WORKDIR /app/apps/web
RUN pnpm run build

# Production Server (Nginx)
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

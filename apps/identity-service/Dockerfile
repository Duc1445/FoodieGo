FROM node:20-alpine
RUN apk add --no-cache wget
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps ./apps
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/identity-service
CMD ["pnpm", "start"]

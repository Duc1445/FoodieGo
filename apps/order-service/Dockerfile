FROM node:20-alpine
RUN apk add --no-cache wget
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps ./apps
RUN npm ci
WORKDIR /app/apps/order-service
CMD ["npm", "start"]

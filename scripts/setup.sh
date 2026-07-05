#!/usr/bin/env bash
# scripts/setup.sh — Bootstrap FoodieGo development environment
set -e

echo "🍔 Setting up FoodieGo..."

# Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
fi

# Install dependencies for all services
for service in gateway user-service food-service order-service; do
  echo "📦 Installing $service dependencies..."
  (cd $service && npm install)
done

echo ""
echo "✅ Setup complete! Run the following to start:"
echo "   docker compose up --build"
echo ""
echo "📍 Services:"
echo "   Gateway:      http://localhost:3000"
echo "   User Service: http://localhost:3001"
echo "   Food Service: http://localhost:3002"
echo "   Order Service:http://localhost:3003"
echo "   Prometheus:   http://localhost:9090"
echo "   Grafana:      http://localhost:3100"

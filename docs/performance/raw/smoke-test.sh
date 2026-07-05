#!/bin/bash
echo "Running smoke tests..."
curl -f http://localhost:3000/health || exit 1
curl -f http://localhost:3001/health || exit 1
curl -f http://localhost:3002/health || exit 1
curl -f http://localhost:3003/health || exit 1
echo "Smoke test passed!"

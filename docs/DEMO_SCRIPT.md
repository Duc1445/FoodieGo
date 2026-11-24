# Demo Video Script

**Target Duration: 5 Minutes**

## [00:00 - 00:30] Introduction
*Visual: Start on the FoodieGo landing page.*
"Hello, this is the final submission demo for FoodieGo. FoodieGo is a microservices-based food delivery platform with a React frontend, Node.js services, PostgreSQL, Redis, RabbitMQ, Docker Compose, GitHub Actions, and SonarQube documentation."

## [00:30 - 01:30] Architecture
*Visual: Show `docs/ARCHITECTURE.md` and the compose topology.*
"The system is organized around an API gateway and several domain services: identity, restaurant, order, inventory, payment, and the food projection service. The gateway is the public entry point, while RabbitMQ supports event-driven flows and compensation."

## [01:30 - 03:00] Features
*Visual: Walk through the app as customer, merchant, driver, and admin.*
"As a customer, I can browse restaurants, manage a cart, and check out with an idempotency key. As a merchant, I can manage menu items and vouchers. As a driver, I can accept deliveries and update their status. As an admin, I can review users, restaurants, orders, support tickets, and dashboard data."

## [03:00 - 04:00] Pipeline
*Visual: Show GitHub Actions workflow files and the Actions tab.*
"The CI/CD pipeline runs lint, typecheck, migrations, tests, and build steps through GitHub Actions. Additional workflows handle contracts, security scans, and release tagging."

## [04:00 - 04:30] SonarQube
*Visual: Show `docs/SONARQUBE.md` and the dashboard screenshot placeholders.*
"SonarQube is part of the submission evidence. The docs describe the quality gate, but the final dashboard screenshot still needs to be captured from the latest successful analysis."

## [04:30 - 04:50] Testing
*Visual: Show terminal output from test runs or coverage artifacts.*
"Testing is layered across the backend, the contracts package, and the frontend. The repository contains coverage artifacts for each service, and the testing doc records the current gaps that still need cleanup before final submission."

## [04:50 - 05:00] Conclusion
*Visual: Return to the landing page or team slide.*
"This concludes the demo. The repository includes the architecture, API, database, testing, CI/CD, SonarQube, and SPQM documentation needed for final review."

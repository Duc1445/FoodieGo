# Demo Video Script

**Target Duration: 5 Minutes**

## [00:00 - 00:30] Introduction
*Visual: Start with the FoodieGo Home Page (Frontend).*
"Hello, this is the final submission demo for FoodieGo, our microservices-based food delivery platform. Our team registered for Level 2 objectives, focusing on architectural patterns, solid test coverage, and continuous integration."

## [00:30 - 01:30] Architecture
*Visual: Show the Architecture Diagram from `ARCHITECTURE.md` or a quick look at `docker-compose.yml`.*
"Under the hood, FoodieGo uses a microservices architecture. We have services for Identity, Restaurant, Order, Inventory, and Payment. They communicate synchronously via an API Gateway and asynchronously through RabbitMQ for event-driven flows, such as the Order Saga."

## [01:30 - 03:00] Features (App Walkthrough)
*Visual: Run through the app.*
"Let's walk through the core flow. 
First, we log in as a customer. We can browse restaurants fetched from the Restaurant Service. 
We add items to the cart and place an order. 
When the order is placed, the Order Service initiates a saga. It publishes an event to reserve stock in the Inventory Service. Once reserved, we simulate a payment through the Payment Service. Finally, the order state is updated to confirmed."

## [03:00 - 04:00] Pipeline
*Visual: Show GitHub Actions dashboard.*
"Moving to DevOps, our CI/CD pipeline runs on GitHub Actions. On every pull request, the pipeline builds the code, runs the linter, executes all unit tests, and uploads the coverage report."

## [04:00 - 04:30] SonarQube
*Visual: Show SonarQube dashboard.*
"We use SonarQube as our Quality Gate. As you can see, we have zero critical bugs and vulnerabilities. Our code coverage is consistently above 80%, satisfying the Level 2 requirements. Duplications are well under the 5% threshold."

## [04:30 - 04:50] Testing
*Visual: Show terminal running `pnpm test` or Jest coverage output.*
"Here is a quick look at our test suite running. We utilized Jest for unit testing across all services, ensuring reliable business logic. We also employ k6 for load testing the gateway."

## [04:50 - 05:00] Conclusion
*Visual: Back to Home Page or Team Slide.*
"This concludes our demo. The SPQM report and all architectural documents are available in the repository. Thank you for watching."

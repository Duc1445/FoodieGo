# CI/CD Documentation

## 1. GitHub Actions Pipeline
Our CI/CD process is automated using GitHub Actions. The pipeline triggers on pushes and pull requests to the `main` branch.

## 2. Pipeline Stages
1. **Checkout & Setup:**
   - Checks out the repository.
   - Sets up Node.js.
   - Caches dependencies (using pnpm).
   
2. **Build:**
   - Installs dependencies.
   - Builds shared packages and microservices.

3. **Lint & Format:**
   - Runs `eslint` and `prettier` to ensure code style consistency.

4. **Test:**
   - Runs unit tests for all services.
   - Collects coverage reports.

5. **SonarQube Analysis:**
   - Uploads test coverage to SonarCloud/SonarQube.
   - Performs static code analysis.
   - Enforces the Quality Gate.

6. **Docker (Optional):**
   - Builds Docker images for each service.
   - Pushes images to a container registry (simulated/optional in this project).

## 3. Deployment
Currently, deployment is handled via Docker Compose for local environments. A production deployment would involve Kubernetes or a cloud provider's container service, triggered after a successful build on the `main` branch.

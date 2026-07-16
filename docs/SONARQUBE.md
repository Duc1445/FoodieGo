# SonarQube Documentation

## 1. Purpose
SonarQube is used to provide a repeatable quality gate for maintainability, reliability, security, duplication, and coverage.

## 2. Quality Gate Expectations
The submission checklist expects the following:
- Coverage at or above the course threshold
- Low duplication
- No blocking bugs
- Acceptable security rating
- Acceptable maintainability rating

## 3. Metrics Explained
| Metric | Meaning |
| --- | --- |
| Coverage | Percentage of executable code exercised by tests. |
| Duplications | Copy-pasted code or repeated logic. |
| Code smells | Maintainability issues that may not fail runtime behavior. |
| Bugs | Defects that can cause actual runtime failures. |
| Reliability rating | Overall bug severity posture. |
| Maintainability rating | Technical debt posture. |
| Security rating | Security vulnerability posture. |

## 4. Repository Configuration Notes
The repository includes `sonar-project.properties`, but it still references legacy source roots such as `user-service` and `analytics-service`.

That means:
- the file is useful as a starting point
- it should be reviewed before the final submission upload
- the docs should not claim a clean SonarQube result unless the dashboard confirms it

## 5. Current Evidence Status
| Evidence | Status | Notes |
| --- | --- | --- |
| Quality gate screenshot | Pending user attachment | Not stored in the repository. |
| Overview dashboard screenshot | Pending user attachment | Add the final dashboard capture here. |
| Coverage values | Partial | Stored coverage artifacts exist, but they are uneven across services. |
| Quality gate pass | Not fully confirmed | Must be verified against the final CI run and SonarQube project. |

## 6. Screenshot Section
Insert the final SonarQube screenshots here before submission:

- Overview dashboard
- Quality gate summary
- Coverage and duplication summary
- Any project issue list the instructor requires

## 7. Submission Guidance
Before the final upload:
1. Reconcile `sonar-project.properties` with the current `apps/*` layout.
2. Start the local SonarQube stack with Docker.
3. Run a scan against `http://localhost:9000` using a generated token.
4. Capture the SonarQube dashboard after the last successful analysis.
5. Attach the screenshots to this section.

## 8. Local Setup

If you are running SonarQube on your own machine, use the Docker services added to `docker-compose.yml`:

```bash
docker compose up -d sonarqube-db sonarqube
```

Then open:

```text
http://localhost:9000
```

The default first-login credentials are usually:

- Username: `admin`
- Password: `admin`

You will be prompted to change the password after the first login.

## 9. How to Run a Scan

1. Open SonarQube and create a token from your account settings.
2. Export the token and host URL in your shell.
3. Run the scanner from Docker or your local toolchain.

Example using the official scanner image:

```bash
docker run --rm ^
  -e SONAR_HOST_URL=http://host.docker.internal:9000 ^
  -e SONAR_TOKEN=<your-token> ^
  -v "%cd%:/usr/src" ^
  sonarsource/sonar-scanner-cli:latest
```

After the scan finishes, refresh the project dashboard and capture:

- Quality Gate
- Coverage
- Duplications
- Issues summary

# SonarQube Documentation

## 1. Overview
SonarQube is integrated into our CI pipeline to ensure code quality and security. 

## 2. Quality Gate
Our Quality Gate enforces the following conditions:
- **Coverage:** >= 80%
- **Duplicated Lines:** <= 5%
- **Reliability Rating:** A (No bugs)
- **Security Rating:** A (No vulnerabilities)
- **Maintainability Rating:** A

## 3. Metrics Explained
- **Coverage:** The percentage of code covered by tests. High coverage reduces the risk of undetected bugs.
- **Duplications:** Identifies copy-pasted code. High duplication makes maintenance difficult.
- **Code Smells:** Maintainability issues that might not break the code but make it harder to read or maintain.
- **Bugs:** Evident errors that will cause failure in production.
- **Reliability:** A measure of how many bugs exist in the code.
- **Maintainability:** A measure of the technical debt.
- **Security Rating:** A measure of the severity of security vulnerabilities found.

## 4. SonarQube Dashboard Screenshots

*(Insert screenshot of SonarQube Overview Dashboard here)*

*(Insert screenshot of SonarQube Quality Gate result here)*

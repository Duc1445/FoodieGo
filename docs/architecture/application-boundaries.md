# Application Boundaries

Inspired by Electron's Process Isolation and IPC patterns:

## 1. Frontend / Backend Isolation
The React Frontend must not contain any business logic or direct database queries. It acts as a pure presentation layer (Renderer Process equivalent).

## 2. Communication Rules
Frontend and Backend communicate strictly through defined HTTP APIs, similar to IPC. The frontend must not attempt to "guess" backend state.

## 3. Data Ownership
Each backend service owns its data strictly. Data fetched by the frontend is a transient snapshot. The backend retains absolute authority over the data lifecycle.

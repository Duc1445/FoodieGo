# 0005. Backend as source of truth

## Status
Accepted

## Context
Frontend state management can become overly complex if it tries to predict or mutate state optimistically without backend confirmation.

## Decision
The backend is the absolute source of truth. The frontend is merely a projection of the backend state. Local mutations (e.g., artificially incrementing cart quantities) are forbidden.

## Consequences
- Simpler frontend state.
- Requires granular UI loading states to mask network latency.

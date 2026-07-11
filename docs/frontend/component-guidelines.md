# Component Guidelines

## 1. Single Responsibility
A React component should ideally do one thing. Separate UI components from smart (container) components.

## 2. State Management Rules
- Local UI state -> `useState`
- Global UI/Client state -> `Zustand`
- Server State (Async) -> `React Query` / backend data mappings.

## 3. Props & Purity
Components should be pure functions of their props where possible. Avoid hidden side-effects in `useEffect`.

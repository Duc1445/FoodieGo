# 11. Risks and Technical Debt

- **Technical Debt**: Global loading states in frontend (acceptable for MVP, but needs granular `pendingItemIds` adoption).
- **Risks**: Distributed transactions can fail. We must implement proper saga patterns and compensations.

# Retry Timeline & Strategy

## Retry Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Original_Queue
    
    Original_Queue --> Consumer
    Consumer --> Success: handle() ok
    Consumer --> Failure: handle() throws
    
    Failure --> RetryManager: Attempt N
    
    state RetryManager {
        direction LR
        Check_Policy --> RETRY: N <= Max
        Check_Policy --> DLQ: N > Max
        Check_Policy --> DROP: If Policy Says Drop
    }
    
    RETRY --> Delayed_Exchange: Publish with TTL
    Delayed_Exchange --> Delayed_Queue: Wait (TTL)
    Delayed_Queue --> Original_Exchange: TTL Expires (DLX routing)
    Original_Exchange --> Original_Queue: Redeliver
    
    DLQ --> Dead_Letter_Events_DB: Insert Audit Record
    Dead_Letter_Events_DB --> Operator_Replay: Manual Action via CLI
    Operator_Replay --> Original_Exchange
```

## Retry Policies
Mapped dynamically in `packages/events/config/retry.policy.json`.
- **Reliable**: 5 retries (1s, 5s, 30s, 1m, 5m) -> DLQ.
- **Fast**: 2 retries (2s, 10s) -> Drop (No DLQ).
- **Payment**: 10 retries (Up to 30 mins) -> DLQ.

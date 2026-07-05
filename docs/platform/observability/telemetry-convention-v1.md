# Telemetry Convention v1

## Purpose
This is the **versioned specification** for all telemetry conventions in FoodieGo. When conventions change, a new version (v2) will be published with a migration guide. Services running on v1 must continue to work during migration periods.

**Version**: `v1`  
**Status**: `Active`  
**Effective Date**: 2026-07-05  
**Supersedes**: N/A

---

## 1. Span Naming Convention

### Format
```
{ComponentName}.{Operation}
```

### Catalog

| Component | Operation | Full Span Name | Type |
|---|---|---|---|
| Gateway | ProxyRequest | `Gateway.ProxyRequest` | Auto |
| OrderService | Checkout | `OrderService.Checkout` | Manual |
| OrderService | ValidateCart | `OrderService.ValidateCart` | Manual |
| PricingPipeline | Calculate | `PricingPipeline.Calculate` | Manual |
| RestaurantService | Search | `RestaurantService.Search` | Manual |
| RestaurantService | FetchMenu | `RestaurantService.FetchMenu` | Manual |
| Dispatcher | ProcessBatch | `Dispatcher.ProcessBatch` | Manual |
| RetryManager | Route | `RetryManager.Route` | Manual |
| Consumer | Process | `{ConsumerName}.Process` | Platform |

### Rules
- Auto-instrumented spans (HTTP, DB, Redis) use OpenTelemetry defaults.
- Manual spans MUST follow `{Component}.{Operation}` format.
- No raw HTTP verbs (`POST /checkout`) as span names.

---

## 2. Metric Naming Convention

### Format
```
{domain}_{signal}_{unit}
```

### Examples
| Convention | Metric Name |
|---|---|
| HTTP server latency | `http_server_duration_ms` |
| DB query latency | `db_query_duration_ms` |
| Event publish latency | `event_publish_duration_ms` |
| Dispatcher batch size | `dispatcher_batch_size` |
| Cache hit count | `cache_hit_total` |

### Rules
- Use `_ms` suffix for millisecond histograms.
- Use `_total` suffix for counters.
- No prefix per service (the `service` label handles this).
- See [Metric Catalog](./metric-catalog.md) for the full list.

---

## 3. Log Schema Convention

### Required Fields (SDK-injected)
| Field | Type | Source |
|---|---|---|
| `timestamp` | ISO 8601 | SDK |
| `severity` | `DEBUG`/`INFO`/`WARN`/`ERROR`/`FATAL` | SDK |
| `service` | String | ENV |
| `environment` | String | ENV |
| `traceId` | String | OTel Context |
| `spanId` | String | OTel Context |

### Optional Fields (Developer-supplied)
| Field | Type | Description |
|---|---|---|
| `requestId` | String | From `x-request-id` header |
| `eventId` | UUID | Domain event ID |
| `duration` | Number | Operation duration in ms |
| `err` | Object | Pino error serializer output |

### Rules
- Logs MUST be JSON in all environments.
- PII redaction is enforced by SDK (see [Logging Policy](./logging-policy.md)).
- Do not log raw `req.body` or `req.headers`.

---

## 4. Span Attribute Convention

### Allowed Attributes (OpenTelemetry Semantic Conventions)

| Category | Attributes |
|---|---|
| HTTP | `http.request.method`, `http.response.status_code`, `url.path` |
| DB | `db.system`, `db.operation`, `db.collection` |
| Messaging | `messaging.system`, `messaging.destination`, `messaging.operation`, `messaging.message.id` |
| Custom | `order.item_count`, `pricing.total`, `checkout.payment_method` |

### Prohibited Attributes
- Any PII: `user.email`, `user.phone`, `user.address`
- Any credential: `auth.token`, `api.key`
- High-cardinality: `order.id` (use only when debugging, never in production sampling)

---

## 5. Resource Attributes

Every service MUST declare these resource attributes (loaded from ENV):

| Attribute | ENV Variable | Example |
|---|---|---|
| `service.name` | `SERVICE_NAME` | `order-service` |
| `service.version` | `SERVICE_VERSION` | `1.0.0` |
| `service.namespace` | (hardcoded) | `foodiego` |
| `deployment.environment` | `DEPLOYMENT_ENVIRONMENT` | `production` |
| `host.name` | `HOST_NAME` / `HOSTNAME` | `order-pod-abc123` |

---

## 6. Label Convention (Prometheus)

### Allowed Labels
`service`, `route`, `method`, `status`, `event_type`, `consumer`, `operation`, `collection`

### Prohibited Labels
`user_id`, `order_id`, `email`, `restaurant_name`, `menu_name`, `session_id`

### Cardinality Rule
Max ~100 unique values per label. Use parameterized routes (`/orders/:id` not `/orders/abc123`).

---

## Migration Policy

When updating to v2:
1. Publish `telemetry-convention-v2.md` with a diff from v1.
2. Provide a **migration guide** for each breaking change.
3. Allow at least **1 minor SDK version** of backward compatibility.
4. Update the Metric Catalog with `Deprecated` versions.
5. Old metric names must continue to be emitted for 1 release cycle.

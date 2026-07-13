# System ERD & Database Ownership

FoodieGo currently uses a Shared PostgreSQL instance (per ADR-001) for MVP simplicity. However, strict logical isolation must be maintained. 

**Rule:** Services cannot `JOIN` tables owned by other services.

## Table Prefix Mapping

| Service | Prefix | Owned Tables |
| :--- | :--- | :--- |
| `identity-service` | `usr_` | `usr_users`, `usr_roles`, `usr_sessions` |
| `restaurant-service`| `mer_` | `mer_restaurants`, `mer_categories`, `mer_menu_items` |
| `order-service` | `ord_` | `ord_orders`, `ord_order_items`, `ord_carts`, `ord_cart_items` |
| `payment-service` | `pay_` | `pay_payments`, `pay_transactions`, `pay_refunds` |
| `inventory-service` | `inv_` | `inv_stocks`, `inv_reservations` |
| `driver-service` | `drv_` | `drv_drivers`, `drv_vehicles`, `drv_delivery_jobs` |
| `admin-service` | `adm_` | `adm_audit_logs`, `adm_settings` |

*Note: Infrastructure tables like Outbox/Inbox (`outbox_messages`, `inbox_messages`) are duplicated and isolated per service schema/prefix.*

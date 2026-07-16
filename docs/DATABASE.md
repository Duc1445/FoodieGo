# Database Documentation

## 1. ER Diagram

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    RESTAURANTS ||--o{ MENU_ITEMS : contains
    RESTAURANTS ||--o{ ORDERS : receives
    ORDERS ||--|{ ORDER_ITEMS : contains
    MENU_ITEMS ||--o{ ORDER_ITEMS : included_in
    ORDERS ||--o| PAYMENTS : has
    MENU_ITEMS ||--o| INVENTORY : tracks

    USERS {
        int id PK
        string email
        string password_hash
        string role
    }

    RESTAURANTS {
        int id PK
        int owner_id FK
        string name
        string address
    }

    MENU_ITEMS {
        int id PK
        int restaurant_id FK
        string name
        decimal price
    }

    ORDERS {
        int id PK
        int user_id FK
        int restaurant_id FK
        string status
        decimal total_amount
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int menu_item_id FK
        int quantity
    }

    PAYMENTS {
        int id PK
        int order_id FK
        string status
        string method
    }
    
    INVENTORY {
        int item_id PK
        int stock
        int reserved
    }
```

## 2. Table Ownership (Microservices)
- **Identity Service:** Owns `USERS` table.
- **Restaurant Service:** Owns `RESTAURANTS`, `MENU_ITEMS` tables.
- **Order Service:** Owns `ORDERS`, `ORDER_ITEMS` tables.
- **Payment Service:** Owns `PAYMENTS` table.
- **Inventory Service:** Owns `INVENTORY` table.

## 3. Relationships
- Foreign keys are enforced logically across services, but strictly within the same database schema where applicable.
- In a true microservice distributed database, foreign keys across services are not enforced by the DB but by API composition. Here they exist in a shared PostgreSQL for simplicity.

## 4. Indexes
- `USERS`: `email` (Unique Index)
- `ORDERS`: `user_id`, `restaurant_id`, `status`
- `MENU_ITEMS`: `restaurant_id`

## 5. Constraints
- Prices and amounts must be non-negative.
- Stock cannot fall below 0.

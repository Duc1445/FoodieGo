# FoodieGo Domain Documentation

## Ubiquitous Language
Ngôn ngữ chung (Ubiquitous Language) được sử dụng để giao tiếp giữa cả Business, Product và Engineering, đảm bảo một từ vựng nhất quán xuyên suốt codebase và document.

| Term | Definition |
| --- | --- |
| **Restaurant** | (Aggregate Root) Thực thể cốt lõi, đại diện cho một cửa hàng/nhà hàng. Mọi thao tác trên Menu đều xuất phát từ Restaurant. |
| **Category** | (Entity) Cách phân nhóm các món ăn bên trong một Restaurant (ví dụ: Đồ uống, Món chính). Không tồn tại độc lập ngoài Restaurant. |
| **MenuItem** | (Entity) Đại diện cho một Món ăn cụ thể được bán, thuộc về một Restaurant và một Category. |
| **ModifierGroup** | (Entity - Tương lai) Tập hợp các tùy chọn bổ sung cho món (ví dụ: "Chọn Size", "Topping"). |
| **ModifierOption** | (Entity - Tương lai) Tùy chọn chi tiết trong ModifierGroup (ví dụ: "Size L", "Trân châu trắng"). |
| **Order** | (Aggregate Root) Đại diện cho một đơn đặt hàng của Customer. |
| **OrderItem** | (Snapshot Value Object) Một mục trong Order, lưu trữ bản sao giá trị tại thời điểm đặt (tên, giá) để bất biến khi MenuItem thay đổi. |
| **CartItem** | (Entity) Một mục trong Giỏ hàng của Customer, liên kết sống (live reference) tới MenuItem. |

## Domain Diagram

```mermaid
classDiagram
    direction TB
    class Restaurant {
        +UUID id
        +String name
        +String description
        +Boolean is_active
    }
    class Category {
        +UUID id
        +String name
        +Integer display_order
    }
    class MenuItem {
        +UUID id
        +String name
        +Decimal price
        +Boolean is_available
    }
    
    class Order {
        +UUID id
        +String status
        +Decimal total_price
    }
    
    class OrderItem {
        +UUID id
        +UUID menu_item_id
        +String menu_item_name
        +Decimal unit_price
        +Integer quantity
        +Decimal subtotal
    }
    
    class CartItem {
        +UUID user_id
        +Integer quantity
    }

    Restaurant "1" *-- "*" Category : owns
    Restaurant "1" *-- "*" MenuItem : owns
    Category "1" o-- "*" MenuItem : categorizes

    Order "1" *-- "*" OrderItem : contains
    MenuItem "1" <-- "*" CartItem : references
    
    %% Snapshot dependency
    OrderItem ..> MenuItem : snapshot from
```

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    RESTAURANTS ||--o{ CATEGORIES : "has"
    RESTAURANTS ||--o{ MENU_ITEMS : "offers"
    CATEGORIES ||--o{ MENU_ITEMS : "contains"
    
    RESTAURANTS {
        uuid id PK
        string name
        string description
        string cover_image
        string logo
        decimal rating
        int total_reviews
        decimal delivery_fee
        decimal minimum_order
        string opening_time
        string closing_time
        string status
        decimal latitude
        decimal longitude
    }
    
    CATEGORIES {
        uuid id PK
        uuid restaurant_id FK
        string name
        int display_order
        boolean is_active
    }
    
    MENU_ITEMS {
        uuid id PK
        uuid restaurant_id FK
        uuid category_id FK
        string name
        string description
        decimal price
        string image_url
        boolean is_available
        int preparation_time
        int display_order
    }
    
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    
    ORDERS {
        uuid id PK
        uuid user_id FK
        string status
        decimal total_price
    }
    
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid menu_item_id
        string menu_item_name
        decimal unit_price
        int quantity
        decimal subtotal
        string note
    }
```

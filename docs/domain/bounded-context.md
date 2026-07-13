# Bounded Contexts

This document defines the strict boundaries of each domain in the FoodieGo platform. These boundaries MUST NOT be crossed via synchronous database queries or shared code outside of explicit API contracts or domain events.

## 1. Identity Context
*   **Purpose:** Manages authentication, authorization, user profiles, and security tokens.
*   **Owning Service:** `identity-service`
*   **Primary Actors:** User, Role, Token

## 2. Customer Context
*   **Purpose:** Manages the customer's pre-checkout experience, profile, wishlist, and tracking views.
*   **Owning Service:** `customer-service` (Currently merged in `order-service` / `web`)
*   **Primary Actors:** Customer, Address, Favorite

## 3. Merchant Context
*   **Purpose:** Manages restaurant details, menus, kitchen queue, and store operations.
*   **Owning Service:** `restaurant-service`
*   **Primary Actors:** Restaurant, Category, MenuItem, KitchenOrder

## 4. Order Context
*   **Purpose:** Manages the lifecycle of an order from cart creation to completion.
*   **Owning Service:** `order-service`
*   **Primary Actors:** Cart, Order, OrderItem

## 5. Payment Context
*   **Purpose:** Handles financial transactions, third-party integrations (Stripe/Momo), refunds, and compensations.
*   **Owning Service:** `payment-service`
*   **Primary Actors:** Payment, Refund, TransactionLog

## 6. Inventory Context
*   **Purpose:** Manages the availability of stock and prevents overselling through reservations.
*   **Owning Service:** `inventory-service`
*   **Primary Actors:** Stock, Reservation

## 7. Delivery / Driver Context
*   **Purpose:** Manages driver profiles, assignments, location tracking, and the physical delivery lifecycle.
*   **Owning Service:** `driver-service` (To be built)
*   **Primary Actors:** Driver, DeliveryJob, Dispatcher, Location

## 8. Admin Context
*   **Purpose:** Backoffice operations, platform metrics, and manual entity approvals.
*   **Owning Service:** `admin-service` (To be built)
*   **Primary Actors:** AdminUser, AuditLog, Report

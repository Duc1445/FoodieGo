# Manual Test Guide - FoodieGo

## Introduction
This document outlines the manual testing procedures for the FoodieGo platform. It covers testing across the Customer, Merchant, Driver, and Admin portals.

## Prerequisites
Before executing these tests, ensure the local environment is fully initialized.

1. **Reset and Seed the Database:**
   ```bash
   pnpm demo:reset
   ```
   This ensures you have a clean slate with deterministic data (Da Nang locations, pre-defined users, realistic menu items, and initial orders).

2. **Start the Application:**
   ```bash
   docker compose up -d
   pnpm dev
   ```

## Portal Access & Test Accounts
Use the following credentials to access the different portals. The password for all test accounts is `123456`.

| Portal | URL | Email | Password |
|---|---|---|---|
| Customer | `http://localhost:5173/login` | `customer1@foodiego.com` (to `customer20@foodiego.com`) | `123456` |
| Merchant | `http://localhost:5173/merchant/login` | `merchant@foodiego.com` | `123456` |
| Driver | `http://localhost:5173/driver/login` | `driver@foodiego.com` | `123456` |
| Admin | `http://localhost:5173/admin/login` | `admin@foodiego.com` | `123456` |

---

## Test Scenarios

### 1. Customer Flow
*   **Login:** Access the Customer portal and log in using a customer account.
*   **Navigation:** Verify that the header contains links to `Home`, `Search`, `Profile`, and `Orders`.
*   **Restaurant Discovery:** Browse the list of available restaurants (should show Da Nang locations like Hải Châu, Thanh Khê). Click on a restaurant to view its menu.
*   **Cart & Checkout:** Add items to the cart. Navigate to checkout, verify the default address is selected, and place the order.
*   **Order Tracking:** Go to the `Orders` page and verify the newly placed order is present with `CREATED` or `PAID` status.

### 2. Merchant Flow
*   **Login:** Access the Merchant portal and log in. Verify that old dashboard data from previous sessions is cleared (cache cleared on logout).
*   **Dashboard:** View the analytics summary on the Dashboard page (Revenue, Total Orders, Active Menu Items).
*   **Order Management:** Navigate to the `Orders` page (`/merchant/orders`).
    *   Verify the list of incoming orders.
    *   Update order statuses: `CONFIRMED` -> `PREPARING` -> `READY`.
*   **Menu Management:** Create a new menu item. Ensure that it successfully saves and appears in the menu list.

### 3. Driver Flow
*   **Login:** Access the Driver portal and log in.
*   **Available Orders:** Check for orders that are in the `READY` state.
*   **Accept Delivery:** Accept an available delivery. The status should update to `DELIVERING`.
*   **Complete Delivery:** Mark the delivery as `COMPLETED`.
    *   *Verification:* Verify in the customer's portal that their order status is updated to `COMPLETED`.
    *   *Earnings:* Verify that the driver's earnings reflect the delivery fee of the completed order.

### 4. Admin Flow
*   **Login:** Access the Admin portal and log in.
*   **Approvals:** Navigate to the Approvals page.
    *   Verify that *only* Merchant and Driver applications are shown.
    *   Approve a pending application and verify it moves to `APPROVED`/`ACTIVE`.
*   **Support Tickets:** Navigate to the Support area. Review the pre-seeded tickets, add an internal note, and update the status (e.g., `OPEN` -> `IN_PROGRESS`).

---

## Known Issues / Manual Verification Required
*   **Browser-Based Verification:** The agent cannot execute browser clicks or verify exact React rendering visually. Manual verification of UI layouts, button clicks, and visual rendering is required.
*   **Cross-Portal E2E:** Real-time updates between portals (e.g., Merchant marks `READY` -> Driver sees available delivery instantly) should be manually tested across two browser windows.

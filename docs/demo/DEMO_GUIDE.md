# FoodieGo Demo Guide

This guide is designed for the July 13th presentation to help developers and testers run the FoodieGo frontend demo locally and understand its features.

## 🚀 Quick Start

1. **Install Dependencies**
   From the root of the project, run:
   ```bash
   pnpm install
   ```

2. **Start the Backend Services**
   The backend relies on Docker for PostgreSQL, Redis, RabbitMQ, and the microservices.
   ```bash
   docker compose up -d
   ```
   *Note: On the first boot, `docker-compose.yml` mounts `infrastructure/postgres/seed.sql` to automatically seed the database with 20 restaurants and 200 menu items. This ensures you have real data to test the frontend with!*

3. **Start the Frontend Application**
   Open a new terminal and start the web frontend:
   ```bash
   pnpm --filter web dev
   ```

4. **Access the Application**
   Open your browser and navigate to: `http://localhost:5173`

## ✨ Features Available in the Demo

The following features have been hardened for this demo sprint:

### 1. 📍 Location-Based Discovery
- Click the location selector in the header (defaults to District 1, HCMC).
- Enter a new address (e.g., "District 2, HCMC") to update your location.
- The **Landing Page** automatically filters and displays only restaurants within **5km** of your selected location using the Haversine distance formula.

### 2. 🏪 Restaurant & Menu Browsing
- Click on any restaurant to view its details (cover image, logo, rating, address).
- The menu items are fetched directly from the **Restaurant Service** API (`/api/v1/menus`) and grouped beautifully by categories.

### 3. 🛒 Shopping Cart Experience
- Select an item to view its details.
- Adjust quantity and click **Add to Cart**.
- A global **Cart Drawer** will open from the right, showing your selected items, subtotal, and total.
- **Business Rule:** The cart strictly enforces a "1-restaurant only" rule. If you try to add items from a different restaurant, it will show an error toast.
- You can clear your cart at any time using the "Clear Cart" button inside the drawer.

### 4. 📈 Restaurant Portal (Admin)
- Click "Restaurant Portal" in the top right.
- You will see a detailed **Dashboard** containing Revenue Trends (Line Chart), Orders, Average Prep Time, and a list of Recent Orders.
- *Note: This dashboard uses mock data since the analytics service is not yet built.*

## ⚠️ Known Limitations (Phase 2)

As we are currently at the end of Phase 2, the following features are mock-only or unimplemented:

1. **Checkout & Payment:** Clicking "Checkout" in the Cart Drawer will simply show an alert. Real checkout flows via Saga will be built in Phase 3.
2. **Global Search:** The Search Page (`/search`) uses an intercepted mock API (`/api/v1/search`) returning empty results.
3. **Authentication:** The Login endpoint is mocked. Real JWT flow is still pending full integration on the frontend.
4. **Order Tracking:** The real-time order tracking map is not yet available.

## 🛠 Troubleshooting

- **No Restaurants Showing:** Make sure Docker is running and the database was seeded. If not, you can run the seed script manually or restart docker: `docker compose down -v && docker compose up -d`.
- **Cart Warning:** If you see "You can only order from one restaurant", simply open the cart and click "Clear Cart" to start a new order.

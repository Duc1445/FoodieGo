import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram, Gauge
from pydantic import BaseModel
from typing import Optional
from datetime import date

app = FastAPI(title="Analytics Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

REQUEST_COUNT = Counter("analytics_requests_total", "Total analytics requests", ["endpoint"])
REVENUE_TOTAL = Gauge("restaurant_revenue_total", "Total restaurant revenue")
EXPENSES_TOTAL = Gauge("restaurant_expenses_total", "Total restaurant expenses")

class Expense(BaseModel):
    description: str
    amount: float
    expense_date: Optional[date] = None

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    expense_date: Optional[date] = None

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            os.environ.get("DATABASE_URL", "postgresql://foodiego:foodiego123@postgres:5432/foodiego")
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

@app.get("/health")
def health_check():
    REQUEST_COUNT.labels(endpoint="/health").inc()
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=503, detail="Database unavailable")
    conn.close()
    return {"status": "ok", "service": "analytics-service"}

@app.get("/")
def get_stats():
    REQUEST_COUNT.labels(endpoint="/").inc()
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if users table exists before querying
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        """)
        users_exist = cur.fetchone()['exists']
        
        # Check if orders table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'orders'
            );
        """)
        orders_exist = cur.fetchone()['exists']

        stats = {
            "total_users": 0,
            "total_orders": 0,
            "total_revenue": 0
        }

        if users_exist:
            cur.execute("SELECT COUNT(*) as count FROM users")
            stats["total_users"] = cur.fetchone()['count']
            
        if orders_exist:
            cur.execute("SELECT COUNT(*) as count FROM orders")
            stats["total_orders"] = cur.fetchone()['count']
            
            # Assuming orders table has a total_price column
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='orders' and column_name='total_price'
            """)
            if cur.fetchone():
                cur.execute("SELECT SUM(total_price) as sum FROM orders WHERE status = 'completed'")
                revenue = cur.fetchone()['sum']
                stats["total_revenue"] = revenue if revenue else 0
                REVENUE_TOTAL.set(stats["total_revenue"])

        # Expenses
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'expenses'
            );
        """)
        if cur.fetchone()['exists']:
            cur.execute("SELECT SUM(amount) as sum FROM expenses")
            exp_sum = cur.fetchone()['sum']
            stats["total_expenses"] = exp_sum if exp_sum else 0
            EXPENSES_TOTAL.set(stats["total_expenses"])
        else:
            stats["total_expenses"] = 0

        cur.close()
        conn.close()
        return stats
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/expenses")
def get_expenses():
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=503)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM expenses ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {"success": True, "data": rows}
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/expenses")
def create_expense(expense: Expense):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=503)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "INSERT INTO expenses (description, amount, expense_date) VALUES (%s, %s, %s) RETURNING *",
            (expense.description, expense.amount, expense.expense_date)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return {"success": True, "data": row}
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/expenses/{id}")
def update_expense(id: str, expense: ExpenseUpdate):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=503)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "UPDATE expenses SET description = COALESCE(%s, description), amount = COALESCE(%s, amount), expense_date = COALESCE(%s, expense_date) WHERE id = %s RETURNING *",
            (expense.description, expense.amount, expense.expense_date, id)
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if not row: raise HTTPException(status_code=404, detail="Expense not found")
        return {"success": True, "data": row}
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/expenses/{id}")
def delete_expense(id: str):
    conn = get_db_connection()
    if not conn: raise HTTPException(status_code=503)
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM expenses WHERE id = %s", (id,))
        deleted = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
        if deleted == 0: raise HTTPException(status_code=404, detail="Expense not found")
        return {"success": True, "message": "Expense deleted"}
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))


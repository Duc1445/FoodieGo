import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram

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

        cur.close()
        conn.close()
        return stats
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))

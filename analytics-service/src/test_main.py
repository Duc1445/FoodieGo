import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.main import app

client = TestClient(app)

@patch("src.main.get_db_connection")
def test_health_check_ok(mock_get_db):
    mock_conn = MagicMock()
    mock_get_db.return_value = mock_conn

    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "analytics-service"}

@patch("src.main.get_db_connection")
def test_health_check_db_fail(mock_get_db):
    mock_get_db.return_value = None

    response = client.get("/health")
    assert response.status_code == 503
    assert response.json() == {"detail": "Database unavailable"}

@patch("src.main.get_db_connection")
def test_get_stats_db_fail(mock_get_db):
    mock_get_db.return_value = None

    response = client.get("/")
    assert response.status_code == 503
    assert response.json() == {"detail": "Database unavailable"}

@patch("src.main.get_db_connection")
def test_get_stats_ok(mock_get_db):
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_conn.cursor.return_value = mock_cur
    mock_get_db.return_value = mock_conn

    # 1. users table exists
    # 2. orders table exists
    # 3. users count (5)
    # 4. orders count (10)
    # 5. total_price column exists
    # 6. total revenue (500)
    mock_cur.fetchone.side_effect = [
        {'exists': True},
        {'exists': True},
        {'count': 5},
        {'count': 10},
        {'column_name': 'total_price'},
        {'sum': 500}
    ]

    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "total_users": 5,
        "total_orders": 10,
        "total_revenue": 500
    }

@patch("src.main.get_db_connection")
def test_get_stats_exception(mock_get_db):
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_conn.cursor.return_value = mock_cur
    mock_get_db.return_value = mock_conn

    mock_cur.execute.side_effect = Exception("Some DB error")

    response = client.get("/")
    assert response.status_code == 500
    assert response.json() == {"detail": "Some DB error"}

import uuid
import pytest
import httpx
import time

BASE_URL = "http://localhost:8000/api/v1"
TIMEOUT = 30.0

@pytest.fixture
def unique_email():
    return f"test_user_{uuid.uuid4().hex[:8]}@genbots.in"

def test_health_and_readiness():
    # Verify health endpoint
    response = httpx.get("http://localhost:8000/health", timeout=TIMEOUT)
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    
    # Verify readiness endpoint
    response = httpx.get("http://localhost:8000/readyz", timeout=TIMEOUT)
    assert response.status_code == 200
    assert response.json()["status"] == "ready"

def test_customer_registration_and_login(unique_email):
    # Register customer
    payload = {
        "email": unique_email,
        "password": "Password@123",
        "first_name": "Test",
        "last_name": "User",
        "phone": "9876543210"
    }
    response = httpx.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
    assert response.status_code == 201
    user_data = response.json()
    assert user_data["email"] == unique_email
    assert user_data["role"] == "customer"
    assert user_data["is_active"] is True
    
    # Try duplicate registration
    response = httpx.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
    assert response.status_code == 409
    assert "Email already registered" in response.json()["detail"]

    # Login customer
    login_payload = {
        "email": unique_email,
        "password": "Password@123"
    }
    response = httpx.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"
    
    # Login with wrong credentials (brute force delay check)
    wrong_payload = {
        "email": unique_email,
        "password": "WrongPassword@123"
    }
    start_time = time.time()
    response = httpx.post(f"{BASE_URL}/auth/login", json=wrong_payload, timeout=TIMEOUT)
    end_time = time.time()
    assert response.status_code == 401
    # Check that failed login has a delay applied (first failure should be at least 1s sleep in endpoint)
    assert (end_time - start_time) >= 0.9

def test_customer_me_profile(unique_email):
    # Register & Login
    payload = {
        "email": unique_email,
        "password": "Password@123",
        "first_name": "Test",
        "last_name": "Profile",
        "phone": "9876543211"
    }
    httpx.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
    tokens = httpx.post(f"{BASE_URL}/auth/login", json={"email": unique_email, "password": "Password@123"}, timeout=TIMEOUT).json()
    access_token = tokens["access_token"]
    
    headers = {"Authorization": f"Bearer {access_token}"}
    
    # Get profile
    response = httpx.get(f"{BASE_URL}/auth/me", headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200
    assert response.json()["email"] == unique_email
    
    # Update profile
    update_payload = {
        "first_name": "UpdatedName",
        "bio": "I am a tester"
    }
    response = httpx.patch(f"{BASE_URL}/auth/me", json=update_payload, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200
    assert response.json()["first_name"] == "UpdatedName"
    assert response.json()["bio"] == "I am a tester"

def test_token_refresh(unique_email):
    # Register & Login
    payload = {
        "email": unique_email,
        "password": "Password@123",
        "first_name": "Test",
        "last_name": "Refresh",
        "phone": "9876543212"
    }
    httpx.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
    tokens = httpx.post(f"{BASE_URL}/auth/login", json={"email": unique_email, "password": "Password@123"}, timeout=TIMEOUT).json()
    refresh_token = tokens["refresh_token"]
    
    # Refresh
    response = httpx.post(f"{BASE_URL}/auth/refresh", json={"refresh_token": refresh_token}, timeout=TIMEOUT)
    assert response.status_code == 200
    new_tokens = response.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens

    # Invalid refresh
    response = httpx.post(f"{BASE_URL}/auth/refresh", json={"refresh_token": "invalid_refresh_token"}, timeout=TIMEOUT)
    assert response.status_code == 401

def test_admin_authentication():
    # Login Admin
    admin_payload = {
        "email": "admin@genbots.in",
        "password": "Admin@123"
    }
    response = httpx.post(f"{BASE_URL}/admin/login", json=admin_payload, timeout=TIMEOUT)
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    admin_token = tokens["access_token"]
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Get Admin Me
    response = httpx.get(f"{BASE_URL}/admin/me", headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200
    assert response.json()["email"] == "admin@genbots.in"
    assert response.json()["role"] == "superadmin"

    # Get Dashboard stats
    response = httpx.get(f"{BASE_URL}/admin/dashboard", headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200
    assert "total_users" in response.json()

def test_authorization_role_enforcement(unique_email):
    # Customer credentials
    payload = {
        "email": unique_email,
        "password": "Password@123",
        "first_name": "Test",
        "last_name": "Auth",
        "phone": "9876543213"
    }
    httpx.post(f"{BASE_URL}/auth/register", json=payload, timeout=TIMEOUT)
    tokens = httpx.post(f"{BASE_URL}/auth/login", json={"email": unique_email, "password": "Password@123"}, timeout=TIMEOUT).json()
    customer_token = tokens["access_token"]
    
    customer_headers = {"Authorization": f"Bearer {customer_token}"}
    
    # Customer trying to access Admin dashboard (should be 401 due to audience mismatch)
    response = httpx.get(f"{BASE_URL}/admin/dashboard", headers=customer_headers, timeout=TIMEOUT)
    assert response.status_code == 401
    
    # Customer trying to access Admin me
    response = httpx.get(f"{BASE_URL}/admin/me", headers=customer_headers, timeout=TIMEOUT)
    assert response.status_code == 401

    # Admin trying to login via customer login endpoint (should fail)
    admin_payload = {
        "email": "admin@genbots.in",
        "password": "Admin@123"
    }
    response = httpx.post(f"{BASE_URL}/auth/login", json=admin_payload, timeout=TIMEOUT)
    assert response.status_code == 401
    assert "Admins must login via admin portal" in response.json()["detail"]

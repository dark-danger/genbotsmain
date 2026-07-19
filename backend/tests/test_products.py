import uuid
import pytest
import httpx
from decimal import Decimal

BASE_URL = "http://localhost:8000/api/v1"
TIMEOUT = 30.0

@pytest.fixture
def admin_headers():
    # Login Admin to get token
    admin_payload = {
        "email": "admin@genbots.in",
        "password": "Admin@123"
    }
    response = httpx.post(f"{BASE_URL}/admin/login", json=admin_payload, timeout=TIMEOUT)
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def customer_headers():
    # Register & Login a customer to get customer token
    unique_email = f"test_customer_{uuid.uuid4().hex[:8]}@genbots.in"
    register_payload = {
        "email": unique_email,
        "password": "Password@123",
        "first_name": "Product",
        "last_name": "Tester",
        "phone": "9999999999"
    }
    response = httpx.post(f"{BASE_URL}/auth/register", json=register_payload, timeout=TIMEOUT)
    assert response.status_code == 201
    
    login_payload = {
        "email": unique_email,
        "password": "Password@123"
    }
    response = httpx.post(f"{BASE_URL}/auth/login", json=login_payload, timeout=TIMEOUT)
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_list_products():
    response = httpx.get(f"{BASE_URL}/products", timeout=TIMEOUT)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

def test_get_featured_products():
    response = httpx.get(f"{BASE_URL}/products/featured", timeout=TIMEOUT)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_product_detail():
    # First get a product slug
    list_resp = httpx.get(f"{BASE_URL}/products", timeout=TIMEOUT)
    assert list_resp.status_code == 200
    items = list_resp.json()["items"]
    if items:
        slug = items[0]["slug"]
        detail_resp = httpx.get(f"{BASE_URL}/products/{slug}", timeout=TIMEOUT)
        assert detail_resp.status_code == 200
        product = detail_resp.json()
        assert product["slug"] == slug
        assert "price" in product
    else:
        # Fallback if no products are seeded
        detail_resp = httpx.get(f"{BASE_URL}/products/non-existent-product", timeout=TIMEOUT)
        assert detail_resp.status_code == 404

def test_create_product_unauthorized(customer_headers):
    # Customer trying to create product
    payload = {
        "name": "Test Unauthorized Product",
        "sku": f"TEST-UNAUTH-{uuid.uuid4().hex[:6].upper()}",
        "price": 99.99,
        "stock_quantity": 10,
        "status": "draft"
    }
    response = httpx.post(f"{BASE_URL}/products", json=payload, headers=customer_headers, timeout=TIMEOUT)
    # Customers do not have admin audience token, should fail with 401/403
    assert response.status_code in (401, 403)

def test_product_crud_as_admin(admin_headers):
    # Create product
    unique_id = uuid.uuid4().hex[:6]
    name = f"Admin Test Product {unique_id}"
    sku = f"TEST-CRUD-{unique_id.upper()}"
    payload = {
        "name": name,
        "sku": sku,
        "price": 149.99,
        "stock_quantity": 25,
        "status": "active",
        "description": "Created during product endpoint CRUD test",
        "tax_rate": 18.00
    }
    response = httpx.post(f"{BASE_URL}/products", json=payload, headers=admin_headers, timeout=TIMEOUT)
    assert response.status_code == 201
    product = response.json()
    assert product["name"] == name
    assert product["sku"] == sku
    product_id = product["id"]
    product_slug = product["slug"]

    # Retrieve product detail
    detail_resp = httpx.get(f"{BASE_URL}/products/{product_slug}", timeout=TIMEOUT)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == product_id

    # Update product
    update_payload = {
        "name": "Admin Test Product Updated",
        "price": 179.99
    }
    update_resp = httpx.patch(f"{BASE_URL}/products/{product_id}", json=update_payload, headers=admin_headers, timeout=TIMEOUT)
    assert update_resp.status_code == 200
    assert update_resp.json()["name"] == "Admin Test Product Updated"
    assert float(update_resp.json()["price"]) == 179.99

    # Delete product
    delete_resp = httpx.delete(f"{BASE_URL}/products/{product_id}", headers=admin_headers, timeout=TIMEOUT)
    assert delete_resp.status_code == 200
    assert "deleted successfully" in delete_resp.json()["message"]

    # Verify deleted
    detail_resp = httpx.get(f"{BASE_URL}/products/{product_slug}", timeout=TIMEOUT)
    assert detail_resp.status_code == 404

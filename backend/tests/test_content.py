import uuid
import pytest
import httpx

BASE_URL = "http://localhost:8000/api/v1"
TIMEOUT = 30.0

@pytest.fixture
def admin_headers():
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
    unique_email = f"test_customer_{uuid.uuid4().hex[:8]}@genbots.in"
    register_payload = {
        "email": unique_email,
        "password": "Password@123",
        "first_name": "Content",
        "last_name": "Tester",
        "phone": "7777777777"
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

def test_software_crud_as_admin(admin_headers):
    # Create Software
    unique_id = uuid.uuid4().hex[:6]
    name = f"Test Bot OS {unique_id}"
    payload = {
        "name": name,
        "description": "Enterprise grade robot operating system",
        "license_type": "proprietary",
        "price": 4999.00,
        "is_active": True
    }
    response = httpx.post(f"{BASE_URL}/software", json=payload, headers=admin_headers, timeout=TIMEOUT)
    assert response.status_code == 201
    sw = response.json()
    assert sw["name"] == name
    sw_id = sw["id"]
    slug = sw["slug"]

    # Get Software detail by slug
    detail_resp = httpx.get(f"{BASE_URL}/software/{slug}", timeout=TIMEOUT)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == sw_id

    # Create Software Version
    version_payload = {
        "version": "1.0.0",
        "release_notes": "Initial stable release",
        "download_url": "https://downloads.genbots.in/bot-os-1.0.0.tar.gz",
        "checksum": "sha256checksumvalue"
    }
    ver_resp = httpx.post(f"{BASE_URL}/software/{sw_id}/versions", json=version_payload, headers=admin_headers, timeout=TIMEOUT)
    assert ver_resp.status_code == 201
    assert ver_resp.json()["version"] == "1.0.0"

    # List Software Versions
    versions_resp = httpx.get(f"{BASE_URL}/software/{sw_id}/versions", timeout=TIMEOUT)
    assert versions_resp.status_code == 200
    assert len(versions_resp.json()) >= 1

    # Update Software
    update_payload = {
        "name": f"Test Bot OS {unique_id} Pro",
        "price": 5999.00
    }
    update_resp = httpx.put(f"{BASE_URL}/software/{sw_id}", json=update_payload, headers=admin_headers, timeout=TIMEOUT)
    assert update_resp.status_code == 200
    assert float(update_resp.json()["price"]) == 5999.00

    # Delete Software
    delete_resp = httpx.delete(f"{BASE_URL}/software/{sw_id}", headers=admin_headers, timeout=TIMEOUT)
    assert delete_resp.status_code == 200
    assert "deleted successfully" in delete_resp.json()["message"]

def test_services_crud_as_admin(admin_headers):
    # Create Service
    unique_id = uuid.uuid4().hex[:6]
    name = f"Robot Training Service {unique_id}"
    payload = {
        "name": name,
        "description": "On-site industrial robot configuration and safety training.",
        "pricing_info": "$1500 per session",
        "is_active": True
    }
    response = httpx.post(f"{BASE_URL}/services", json=payload, headers=admin_headers, timeout=TIMEOUT)
    assert response.status_code == 201
    svc = response.json()
    assert svc["name"] == name
    svc_id = svc["id"]
    slug = svc["slug"]

    # Get Service
    detail_resp = httpx.get(f"{BASE_URL}/services/{slug}", timeout=TIMEOUT)
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == svc_id

    # Update Service
    update_payload = {
        "name": f"Robot Training Service {unique_id} Premium",
        "pricing_info": "$2000 per session"
    }
    update_resp = httpx.put(f"{BASE_URL}/services/{svc_id}", json=update_payload, headers=admin_headers, timeout=TIMEOUT)
    assert update_resp.status_code == 200
    assert update_resp.json()["pricing_info"] == "$2000 per session"

    # Delete Service
    delete_resp = httpx.delete(f"{BASE_URL}/services/{svc_id}", headers=admin_headers, timeout=TIMEOUT)
    assert delete_resp.status_code == 200
    assert "deleted successfully" in delete_resp.json()["message"]

def test_public_and_cms_endpoints():
    # Newsletter Subscription
    sub_payload = {"email": f"tester_{uuid.uuid4().hex[:8]}@genbots.in"}
    resp = httpx.post(f"{BASE_URL}/newsletter", json=sub_payload, timeout=TIMEOUT)
    assert resp.status_code == 201
    assert "subscribed" in resp.json()["message"].lower()

    # Contact Submission
    contact_payload = {
        "name": "Contact Tester",
        "email": "contact_test@genbots.in",
        "subject": "Testing subject",
        "message": "Testing message body"
    }
    resp = httpx.post(f"{BASE_URL}/contact", json=contact_payload, timeout=TIMEOUT)
    assert resp.status_code == 201
    assert "submitted" in resp.json()["message"].lower()

    # List FAQs
    resp = httpx.get(f"{BASE_URL}/faqs", timeout=TIMEOUT)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # List Testimonials
    resp = httpx.get(f"{BASE_URL}/testimonials", timeout=TIMEOUT)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_support_tickets_flow(customer_headers):
    # Create ticket
    payload = {
        "subject": "Test Ticket Subject",
        "description": "My robot is refusing to clean up the warehouse.",
        "priority": "high",
        "category": "technical"
    }
    response = httpx.post(f"{BASE_URL}/support/tickets", json=payload, headers=customer_headers, timeout=TIMEOUT)
    assert response.status_code == 201
    ticket = response.json()
    assert ticket["subject"] == "Test Ticket Subject"
    ticket_id = ticket["id"]

    # List tickets
    list_resp = httpx.get(f"{BASE_URL}/support/tickets", headers=customer_headers, timeout=TIMEOUT)
    assert list_resp.status_code == 200
    assert any(t["id"] == ticket_id for t in list_resp.json())

    # Add message
    msg_payload = {"message": "Any updates on this ticket?"}
    msg_resp = httpx.post(f"{BASE_URL}/support/tickets/{ticket_id}/messages", json=msg_payload, headers=customer_headers, timeout=TIMEOUT)
    assert msg_resp.status_code == 201
    assert msg_resp.json()["message"] == "Any updates on this ticket?"

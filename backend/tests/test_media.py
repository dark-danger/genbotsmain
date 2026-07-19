import io
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
        "first_name": "Media",
        "last_name": "Tester",
        "phone": "8888888888"
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

def test_upload_media_unauthorized(customer_headers):
    # Customer tries to upload media
    files = {"file": ("test.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", "image/png")}
    data = {"folder": "general", "alt_text": "Customer Alt"}
    response = httpx.post(f"{BASE_URL}/media/upload", files=files, data=data, headers=customer_headers, timeout=TIMEOUT)
    assert response.status_code in (401, 403)

def test_upload_valid_media(admin_headers):
    # Valid PNG headers
    png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    files = {"file": ("valid_test.png", png_content, "image/png")}
    data = {"folder": "test_folder", "alt_text": "Valid Admin Alt"}
    
    response = httpx.post(f"{BASE_URL}/media/upload", files=files, data=data, headers=admin_headers, timeout=TIMEOUT)
    assert response.status_code == 201
    media = response.json()
    assert media["original_filename"] == "valid_test.png"
    assert media["folder"] == "test_folder"
    assert media["alt_text"] == "Valid Admin Alt"
    assert "url" in media
    media_id = media["id"]

    # List media
    list_resp = httpx.get(f"{BASE_URL}/media", params={"folder": "test_folder"}, headers=admin_headers, timeout=TIMEOUT)
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(item["id"] == media_id for item in items)

    # Delete media
    delete_resp = httpx.delete(f"{BASE_URL}/media/{media_id}", headers=admin_headers, timeout=TIMEOUT)
    assert delete_resp.status_code == 200
    assert "deleted successfully" in delete_resp.json()["message"]

def test_upload_magic_bytes_check(admin_headers):
    # Send a text file with a .png extension
    invalid_content = b"This is plain text not PNG"
    files = {"file": ("fake.png", invalid_content, "image/png")}
    response = httpx.post(f"{BASE_URL}/media/upload", files=files, headers=admin_headers, timeout=TIMEOUT)
    assert response.status_code == 400
    assert "File signature verification failed" in response.json()["detail"]

def test_upload_too_large(admin_headers):
    # Exceed settings.MAX_FILE_SIZE (10MB)
    large_content = b"x" * (10 * 1024 * 1024 + 1024)  # 10MB + 1KB
    files = {"file": ("large.png", large_content, "image/png")}
    response = httpx.post(f"{BASE_URL}/media/upload", files=files, headers=admin_headers, timeout=TIMEOUT)
    assert response.status_code == 413
    assert "exceeds maximum allowed size" in response.json()["detail"]

"""Settings API endpoints - manage store wide settings."""
import os
import json
from fastapi import APIRouter
from app.core.deps import CurrentAdmin

router = APIRouter(prefix="/settings", tags=["Settings"])

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "settings.json")

def get_settings():
    if not os.path.exists(SETTINGS_FILE):
        return {"enable_gst": False}
    with open(SETTINGS_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return {"enable_gst": False}

@router.get("")
async def fetch_settings():
    """Get current store settings (publicly readable so frontend cart knows it, or we could keep it admin-only, but frontend doesn't actually calculate tax, only backend does)."""
    return get_settings()

@router.post("")
async def update_settings(data: dict, admin: CurrentAdmin):
    """Update store settings."""
    settings = get_settings()
    settings.update(data)
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f)
    return settings

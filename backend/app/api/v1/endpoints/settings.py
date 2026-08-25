"""Settings API endpoints - manage store wide settings."""
import os
import json
from fastapi import APIRouter
from app.core.deps import CurrentAdmin

router = APIRouter(prefix="/settings", tags=["Settings"])

DEFAULT_SETTINGS = {"enable_gst": False}
_in_memory_settings = dict(DEFAULT_SETTINGS)

PRIMARY_SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "settings.json")
FALLBACK_SETTINGS_FILE = "/tmp/genbots_settings.json"


def _get_target_file():
    if os.path.exists(PRIMARY_SETTINGS_FILE):
        return PRIMARY_SETTINGS_FILE
    if os.path.exists(FALLBACK_SETTINGS_FILE):
        return FALLBACK_SETTINGS_FILE
    return PRIMARY_SETTINGS_FILE


def get_settings():
    target = _get_target_file()
    if os.path.exists(target):
        try:
            with open(target, "r") as f:
                data = json.load(f)
                _in_memory_settings.update(data)
                return _in_memory_settings
        except Exception:
            pass
    return _in_memory_settings


@router.get("")
async def fetch_settings():
    """Get current store settings."""
    return get_settings()


@router.post("")
async def update_settings(data: dict, admin: CurrentAdmin):
    """Update store settings."""
    settings = get_settings()
    settings.update(data)
    _in_memory_settings.update(settings)

    # Attempt to write to primary or fallback
    written = False
    for path in (PRIMARY_SETTINGS_FILE, FALLBACK_SETTINGS_FILE):
        try:
            with open(path, "w") as f:
                json.dump(_in_memory_settings, f)
            written = True
            break
        except Exception:
            continue

    return _in_memory_settings

"""Settings API endpoints - manage store wide and module visibility settings."""
import os
import json
import uuid
from typing import Optional
from fastapi import APIRouter
from sqlalchemy import select
from app.core.deps import DbSession, CurrentAdmin
from app.models.cms import SiteSetting

router = APIRouter(prefix="/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "enable_gst": False,
    "enable_store": True,
    "enable_software": True,
    "enable_services": True,
    "enable_lab_setup": True,
    "enable_projects": True,
    "enable_training": True,
    "enable_blog": True,
    "enable_career": True,
    "enable_contact": True,
}
_in_memory_settings = dict(DEFAULT_SETTINGS)

PRIMARY_SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "settings.json")
FALLBACK_SETTINGS_FILE = "/tmp/genbots_settings.json"


def _get_target_file():
    if os.path.exists(PRIMARY_SETTINGS_FILE):
        return PRIMARY_SETTINGS_FILE
    if os.path.exists(FALLBACK_SETTINGS_FILE):
        return FALLBACK_SETTINGS_FILE
    return PRIMARY_SETTINGS_FILE


def _load_file_settings():
    target = _get_target_file()
    if os.path.exists(target):
        try:
            with open(target, "r") as f:
                data = json.load(f)
                _in_memory_settings.update(data)
        except Exception:
            pass
    return _in_memory_settings


def get_settings():
    """Synchronous helper for reading active settings."""
    return _load_file_settings()


@router.get("")
async def fetch_settings(db: DbSession):
    """Get current store and module visibility settings."""
    current = dict(DEFAULT_SETTINGS)
    current.update(_load_file_settings())

    try:
        result = await db.execute(select(SiteSetting))
        rows = result.scalars().all()
        for r in rows:
            if r.value_type == "boolean":
                current[r.key] = r.value.lower() in ("true", "1", "yes")
            elif r.value_type == "json":
                try:
                    current[r.key] = json.loads(r.value)
                except Exception:
                    current[r.key] = r.value
            else:
                current[r.key] = r.value
    except Exception:
        pass

    _in_memory_settings.update(current)
    return current


@router.post("")
async def update_settings(data: dict, db: DbSession, admin: CurrentAdmin):
    """Update store and module visibility settings."""
    current = dict(DEFAULT_SETTINGS)
    current.update(_load_file_settings())

    try:
        result = await db.execute(select(SiteSetting))
        rows = result.scalars().all()
        for r in rows:
            if r.value_type == "boolean":
                current[r.key] = r.value.lower() in ("true", "1", "yes")
            elif r.value_type == "json":
                try:
                    current[r.key] = json.loads(r.value)
                except Exception:
                    current[r.key] = r.value
            else:
                current[r.key] = r.value
    except Exception:
        pass

    current.update(data)
    _in_memory_settings.update(current)

    # Persist each key-value pair to database site_settings
    try:
        for key, val in data.items():
            val_type = "boolean" if isinstance(val, bool) else ("json" if isinstance(val, (dict, list)) else "string")
            str_val = str(val) if not isinstance(val, (dict, list)) else json.dumps(val)

            existing = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
            setting_row = existing.scalar_one_or_none()
            if setting_row:
                setting_row.value = str_val
                setting_row.value_type = val_type
            else:
                new_row = SiteSetting(
                    id=uuid.uuid4(),
                    key=key,
                    value=str_val,
                    value_type=val_type,
                    group="modules" if key.startswith("enable_") else "general"
                )
                db.add(new_row)
        await db.commit()
    except Exception:
        pass

    # Also persist to file for local redundancy
    for path in (PRIMARY_SETTINGS_FILE, FALLBACK_SETTINGS_FILE):
        try:
            with open(path, "w") as f:
                json.dump(_in_memory_settings, f)
            break
        except Exception:
            continue

    return _in_memory_settings

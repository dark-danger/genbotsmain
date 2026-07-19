from typing import Any, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cms import AuditLog

async def log_audit_action(
    db: AsyncSession,
    user_id: Optional[UUID],
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> None:
    """Log an administrative or system action into the audit_logs table."""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        details=details,
        ip_address=ip_address,
    )
    db.add(audit_log)
    await db.flush()

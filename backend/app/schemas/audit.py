from typing import Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

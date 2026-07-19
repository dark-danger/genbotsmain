"""Notification utility for broadcasting administrative system alerts."""
from sqlalchemy import select
from app.models.user import User
from app.models.cms import Notification

async def trigger_admin_notification(
    db,
    title: str,
    message: str,
    notification_type: str = "info",
    link: str = None
) -> None:
    """Broadcasts a notification to all admin and superadmin users."""
    try:
        # Find all administrators
        result = await db.execute(
            select(User).where(User.role.in_(["admin", "superadmin"]))
        )
        admins = result.scalars().all()
        for admin in admins:
            notif = Notification(
                user_id=admin.id,
                title=title,
                message=message,
                notification_type=notification_type,
                link=link,
                is_read=False
            )
            db.add(notif)
        await db.flush()
    except Exception as e:
        # Prevent notification failures from failing parent database transactions
        pass

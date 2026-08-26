"""Telegram webhook endpoint."""
from fastapi import APIRouter, Request, status, BackgroundTasks
from app.services.telegram_bot import handle_telegram_update

router = APIRouter(prefix="/telegram", tags=["Telegram Bot"])

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """Receive Telegram Webhook updates and process actions in background."""
    try:
        data = await request.json()
        background_tasks.add_task(handle_telegram_update, data)
    except Exception:
        pass
    return {"ok": True}

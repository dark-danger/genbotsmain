"""Telegram Bot Service for processing webhook events and order actions."""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import httpx
from sqlalchemy import select

from app.core.config import settings
from app.core.database import async_session_factory
from app.models.order import Order
from app.utils.telegram import answer_callback_query, send_telegram_message

logger = logging.getLogger(__name__)


async def handle_telegram_update(update: Dict[str, Any]) -> None:
    """Process incoming Telegram update (callback query or message)."""
    
    # 1. Handle Button Click (Callback Query)
    if "callback_query" in update:
        cb = update["callback_query"]
        cb_id = cb["id"]
        from_user = cb.get("from", {})
        sender_id = str(from_user.get("id"))
        data = cb.get("data", "")
        
        # Security check: only allow admin chat ID
        admin_chat_id = str(settings.TELEGRAM_CHAT_ID or "")
        if admin_chat_id and sender_id != admin_chat_id:
            await answer_callback_query(cb_id, text="⚠️ Unauthorized action.", show_alert=True)
            return

        if data.startswith("status:"):
            parts = data.split(":")
            if len(parts) >= 3:
                action = parts[1]        # shipped, delivered, cancelled
                order_num = parts[2]     # GB-XXXX

                success, result_msg = await update_order_status(order_num, action)
                await answer_callback_query(cb_id, text=result_msg, show_alert=True)
                
                # Send confirmation message
                if success:
                    emoji = "🚚" if action == "shipped" else ("✅" if action == "delivered" else "❌")
                    confirmation = (
                        f"{emoji} <b>Order Status Updated!</b>\n"
                        f"━━━━━━━━━━━━━━━━━━━\n"
                        f"🆔 <b>Order ID:</b> <code>{order_num}</code>\n"
                        f"📊 <b>New Status:</b> <b>{action.upper()}</b>\n"
                        f"⏰ <b>Updated At:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                        f"━━━━━━━━━━━━━━━━━━━"
                    )
                    await send_telegram_message(confirmation)
        return

    # 2. Handle Text Command/Message
    if "message" in update:
        msg = update["message"]
        from_user = msg.get("from", {})
        sender_id = str(from_user.get("id"))
        text = msg.get("text", "").strip()

        admin_chat_id = str(settings.TELEGRAM_CHAT_ID or "")
        if admin_chat_id and sender_id != admin_chat_id:
            return

        if not text:
            return

        lower_text = text.lower()

        # Check for status commands like: "GB-123 delivered" or "/delivered GB-123"
        for action in ["delivered", "shipped", "cancelled", "confirmed"]:
            if action in lower_text:
                # Find order number in text (usually starts with GB-)
                words = text.split()
                order_num = None
                for w in words:
                    cleaned_w = w.strip("/,.;:")
                    if "gb-" in cleaned_w.lower():
                        order_num = cleaned_w
                        break

                if order_num:
                    success, result_msg = await update_order_status(order_num, action)
                    emoji = "✅" if success else "⚠️"
                    await send_telegram_message(f"{emoji} {result_msg}")
                    return

        if lower_text in ["/start", "start", "hi", "hello"]:
            welcome = (
                "🤖 <b>GenBots Order Assistant is Active!</b>\n\n"
                "Aap naye orders ke notifications ke niche diye gaye buttons se status update kar sakte hain, ya text command bhej sakte hain:\n"
                "• <code>&lt;Order_ID&gt; delivered</code>\n"
                "• <code>&lt;Order_ID&gt; shipped</code>\n"
                "• <code>&lt;Order_ID&gt; cancelled</code>"
            )
            await send_telegram_message(welcome)


async def update_order_status(order_number: str, new_status: str) -> tuple[bool, str]:
    """Find order in DB and update its status."""
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if new_status not in valid_statuses:
        return False, f"Invalid status: {new_status}"

    try:
        async with async_session_factory() as db:
            result = await db.execute(select(Order).where(Order.order_number.ilike(order_number)))
            order = result.scalar_one_or_none()

            if not order:
                return False, f"Order {order_number} not found in database."

            order.status = new_status
            now = datetime.now(timezone.utc)

            if new_status == "delivered":
                order.delivered_at = now
                # If COD and delivered, mark payment as paid
                if order.payment_method == "cod":
                    order.payment_status = "paid"
            elif new_status == "shipped":
                order.shipped_at = now
            elif new_status == "cancelled":
                order.cancelled_at = now

            await db.commit()
            logger.info(f"Order {order.order_number} status updated to {new_status} via Telegram.")
            return True, f"Order {order.order_number} marked as {new_status.upper()} in website!"
    except Exception as e:
        logger.error(f"Error updating order status for {order_number}: {str(e)}")
        return False, f"Database error: {str(e)}"


# ── Background Polling Loop ──────────────────────────────────

_polling_task: Optional[asyncio.Task] = None

async def telegram_polling_loop():
    """Lightweight background worker to receive updates from Telegram in development/runtime."""
    bot_token = settings.TELEGRAM_BOT_TOKEN
    if not bot_token:
        return

    logger.info("Starting Telegram Bot long-polling worker...")
    offset = 0

    async with httpx.AsyncClient(timeout=35.0) as client:
        while True:
            try:
                url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
                params = {"offset": offset, "timeout": 25}
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("ok"):
                        for item in data.get("result", []):
                            offset = item["update_id"] + 1
                            asyncio.create_task(handle_telegram_update(item))
                elif response.status_code == 409:
                    # Webhook is active elsewhere, sleep longer
                    await asyncio.sleep(10)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"Telegram polling error (retrying): {e}")
                await asyncio.sleep(5)


def start_telegram_polling() -> Optional[asyncio.Task]:
    """Start polling background task."""
    global _polling_task
    if _polling_task is None or _polling_task.done():
        if settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID:
            _polling_task = asyncio.create_task(telegram_polling_loop())
    return _polling_task


def stop_telegram_polling() -> None:
    """Stop polling background task."""
    global _polling_task
    if _polling_task and not _polling_task.done():
        _polling_task.cancel()
        _polling_task = None

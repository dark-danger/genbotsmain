"""Telegram notification utility for order alerts, interactive actions, and admin broadcasts."""
import os
import httpx
import logging
from typing import Optional, List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_bot_token(override: Optional[str] = None) -> Optional[str]:
    return override or getattr(settings, "TELEGRAM_BOT_TOKEN", None) or os.getenv("TELEGRAM_BOT_TOKEN")

def _get_chat_id(override: Optional[str] = None) -> Optional[str]:
    return override or getattr(settings, "TELEGRAM_CHAT_ID", None) or os.getenv("TELEGRAM_CHAT_ID")

async def send_telegram_message(
    message: str,
    chat_id: Optional[str] = None,
    bot_token: Optional[str] = None,
    parse_mode: str = "HTML",
    reply_markup: Optional[Dict[str, Any]] = None,
) -> bool:
    """Send a text message with optional inline keyboard buttons to Telegram."""
    token = _get_bot_token(bot_token)
    target_chat_id = _get_chat_id(chat_id)

    if not token or not target_chat_id:
        logger.warning("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured.")
        return False

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload: Dict[str, Any] = {
        "chat_id": target_chat_id,
        "text": message,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True,
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                logger.info(f"Telegram notification sent successfully to chat_id={target_chat_id}")
                return True
            else:
                logger.error(f"Failed to send Telegram message: {response.status_code} - {response.text}")
                return False
    except Exception as e:
        logger.error(f"Error sending Telegram notification: {str(e)}")
        return False


async def answer_callback_query(
    callback_query_id: str,
    text: str,
    show_alert: bool = False,
    bot_token: Optional[str] = None,
) -> bool:
    """Acknowledge Telegram callback query with feedback toast alert."""
    token = bot_token or getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    if not token:
        return False

    url = f"https://api.telegram.org/bot{token}/answerCallbackQuery"
    payload = {
        "callback_query_id": callback_query_id,
        "text": text,
        "show_alert": show_alert,
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(url, json=payload)
            return True
    except Exception as e:
        logger.error(f"Error answering callback query: {str(e)}")
        return False


async def edit_message_reply_markup(
    chat_id: str,
    message_id: int,
    reply_markup: Optional[Dict[str, Any]] = None,
    bot_token: Optional[str] = None,
) -> bool:
    """Edit inline buttons of an existing message."""
    token = bot_token or getattr(settings, "TELEGRAM_BOT_TOKEN", None)
    if not token:
        return False

    url = f"https://api.telegram.org/bot{token}/editMessageReplyMarkup"
    payload = {
        "chat_id": chat_id,
        "message_id": message_id,
        "reply_markup": reply_markup or {"inline_keyboard": []},
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(url, json=payload)
            return True
    except Exception as e:
        logger.error(f"Error updating message reply markup: {str(e)}")
        return False


async def send_order_telegram_notification(
    order_number: str,
    customer_name: str,
    customer_phone: str,
    city: str,
    total_amount: float,
    payment_method: str = "COD",
    status: str = "confirmed",
    items: Optional[List[Dict[str, Any]]] = None,
    include_buttons: bool = True,
) -> bool:
    """Format and send a new order notification with interactive action buttons."""
    
    items_text = ""
    if items:
        items_list = []
        for it in items:
            p_name = it.get("product_name", "Item")
            qty = it.get("quantity", 1)
            price = it.get("unit_price") or it.get("total_price", 0)
            items_list.append(f"  • {p_name} x {qty} (₹{price})")
        if items_list:
            items_text = "\n📦 <b>Items:</b>\n" + "\n".join(items_list)

    msg = (
        f"🛍️ <b>NEW ORDER RECEIVED!</b>\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"🆔 <b>Order ID:</b> <code>{order_number}</code>\n"
        f"👤 <b>Customer Name:</b> {customer_name or 'N/A'}\n"
        f"📞 <b>Phone:</b> {customer_phone or 'N/A'}\n"
        f"📍 <b>City:</b> {city or 'N/A'}\n"
        f"💰 <b>Total Amount:</b> ₹{total_amount:,.2f}\n"
        f"💳 <b>Payment:</b> {payment_method.upper()} ({status.capitalize()})\n"
        f"{items_text}\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"⚡ <i>GenBots Order Alert</i>"
    )

    reply_markup = None
    if include_buttons:
        reply_markup = {
            "inline_keyboard": [
                [
                    {"text": "🚚 Mark Shipped", "callback_data": f"status:shipped:{order_number}"},
                    {"text": "✅ Mark Delivered", "callback_data": f"status:delivered:{order_number}"},
                ],
                [
                    {"text": "❌ Cancel Order", "callback_data": f"status:cancelled:{order_number}"},
                ]
            ]
        }

    return await send_telegram_message(msg, reply_markup=reply_markup)

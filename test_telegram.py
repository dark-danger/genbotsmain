"""Quick test script to verify Telegram order notifications."""
import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from app.utils.telegram import send_order_telegram_notification, send_telegram_message

async def main():
    print("Testing Telegram Notification...")
    
    success = await send_order_telegram_notification(
        order_number="GB-DEMO-9999",
        customer_name="Test Customer",
        customer_phone="9211067540",
        city="Delhi",
        total_amount=1999.00,
        payment_method="COD",
        status="confirmed",
        items=[
            {"product_name": "Arduino Starter Kit", "quantity": 1, "unit_price": 1499.00},
            {"product_name": "Ultrasonic Sensor HC-SR04", "quantity": 2, "unit_price": 250.00},
        ]
    )

    if success:
        print("✅ Telegram notification sent successfully! Check your phone.")
    else:
        print("❌ Failed to send Telegram notification. Please check your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.")

if __name__ == "__main__":
    asyncio.run(main())

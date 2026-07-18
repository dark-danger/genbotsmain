"""Background tasks for email, notifications, etc."""
from app.tasks.celery_app import celery_app
from loguru import logger


@celery_app.task(name="send_email")
def send_email_task(to_email: str, subject: str, body: str):
    """Send email via SMTP (background task)."""
    logger.info(f"Sending email to {to_email}: {subject}")
    # Email sending implementation would go here
    # Using aiosmtplib in production
    return {"status": "sent", "to": to_email}


@celery_app.task(name="send_order_confirmation")
def send_order_confirmation_task(order_id: str, user_email: str):
    """Send order confirmation email."""
    logger.info(f"Sending order confirmation for {order_id} to {user_email}")
    return {"status": "sent", "order_id": order_id}


@celery_app.task(name="generate_invoice")
def generate_invoice_task(order_id: str):
    """Generate PDF invoice for an order."""
    logger.info(f"Generating invoice for order {order_id}")
    return {"status": "generated", "order_id": order_id}

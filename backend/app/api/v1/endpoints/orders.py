"""Orders API endpoints - checkout, payment verification, webhooks, order tracking."""
import os
import hmac
import hashlib
import uuid
from datetime import datetime, timezone

import razorpay
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.deps import DbSession, CurrentUser
from app.models.product import CartItem, Product
from app.models.order import Order, OrderItem, Payment

router = APIRouter(prefix="/orders", tags=["Orders"])

# Load credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

rz_client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    rz_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


# ── Request/Response Schemas ────────────────────────────────

class CheckoutRequest(BaseModel):
    shipping_name: str
    shipping_phone: str
    shipping_address_line1: str
    shipping_address_line2: str | None = None
    shipping_city: str
    shipping_state: str
    shipping_postal_code: str
    shipping_country: str = "India"
    customer_note: str | None = None
    coupon_code: str | None = None
    payment_method: str = "razorpay"  # razorpay | cod


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str


# ── Helper ───────────────────────────────────────────────────

def generate_order_number() -> str:
    """Generate a unique order number like GB-20260719-XXXX."""
    now = datetime.now(timezone.utc)
    random_part = uuid.uuid4().hex[:6].upper()
    return f"GB-{now.strftime('%Y%m%d')}-{random_part}"


# ── Endpoints ────────────────────────────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(data: CheckoutRequest, db: DbSession, user: CurrentUser):
    """Create an order from the user's cart, then create a Razorpay order for payment."""

    # 1. Get cart items
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user.id)
        .options(selectinload(CartItem.product), selectinload(CartItem.variant))
    )
    cart_items = result.scalars().all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Calculate totals & validate stock
    order_items = []
    subtotal = 0
    for ci in cart_items:
        product = ci.product
        if product.stock_quantity < ci.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock_quantity}"
            )
        price = float(ci.variant.price) if ci.variant and ci.variant.price else float(product.price)
        item_total = price * ci.quantity
        subtotal += item_total

        order_items.append({
            "product_id": ci.product_id,
            "variant_id": ci.variant_id,
            "product_name": product.name,
            "product_sku": product.sku,
            "product_image": product.images[0].url if product.images else None,
            "variant_name": ci.variant.name if ci.variant else None,
            "quantity": ci.quantity,
            "unit_price": price,
            "total_price": item_total,
        })

    tax_amount = round(subtotal * 0.18, 2)
    total_amount = round(subtotal + tax_amount, 2)

    # 3. Create Order in DB
    order = Order(
        order_number=generate_order_number(),
        user_id=user.id,
        status="pending",
        payment_status="pending",
        subtotal=subtotal,
        tax_amount=tax_amount,
        shipping_amount=0,
        discount_amount=0,
        total_amount=total_amount,
        coupon_code=data.coupon_code,
        shipping_name=data.shipping_name,
        shipping_phone=data.shipping_phone,
        shipping_address_line1=data.shipping_address_line1,
        shipping_address_line2=data.shipping_address_line2,
        shipping_city=data.shipping_city,
        shipping_state=data.shipping_state,
        shipping_postal_code=data.shipping_postal_code,
        shipping_country=data.shipping_country,
        payment_method=data.payment_method,
        customer_note=data.customer_note,
    )
    db.add(order)
    await db.flush()

    # 4. Create OrderItems
    for oi_data in order_items:
        oi = OrderItem(order_id=order.id, **oi_data)
        db.add(oi)

    # 5. Deduct stock
    for ci in cart_items:
        ci.product.stock_quantity -= ci.quantity
        ci.product.sold_count += ci.quantity

    # 6. Clear cart
    for ci in cart_items:
        await db.delete(ci)

    await db.flush()

    # 7. If COD, no Razorpay needed
    if data.payment_method == "cod":
        order.status = "confirmed"
        await db.flush()
        return {
            "order_id": str(order.id),
            "order_number": order.order_number,
            "total_amount": float(total_amount),
            "payment_method": "cod",
            "status": "confirmed",
        }

    # 8. Create Razorpay order
    if not rz_client:
        raise HTTPException(status_code=500, detail="Razorpay credentials not configured")

    try:
        rz_order = rz_client.order.create({
            "amount": int(total_amount * 100),  # convert to paise
            "currency": "INR",
            "receipt": order.order_number,
            "notes": {
                "order_id": str(order.id),
                "user_email": user.email,
            },
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay error: {str(e)}")

    # 9. Save payment record
    payment = Payment(
        order_id=order.id,
        payment_method="razorpay",
        gateway_order_id=rz_order["id"],
        amount=total_amount,
        currency="INR",
        status="initiated",
    )
    db.add(payment)
    await db.flush()

    return {
        "order_id": str(order.id),
        "order_number": order.order_number,
        "total_amount": float(total_amount),
        "razorpay_order_id": rz_order["id"],
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "currency": "INR",
        "status": "pending",
    }


@router.post("/verify-payment")
async def verify_payment(data: VerifyPaymentRequest, db: DbSession, user: CurrentUser):
    """Verify Razorpay payment signature and update order status."""
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay credentials not configured")

    # Verify HMAC signature
    msg = f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode("utf-8")
    secret = RAZORPAY_KEY_SECRET.encode("utf-8")
    generated_signature = hmac.new(secret, msg, hashlib.sha256).hexdigest()

    if generated_signature != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Payment verification failed: signature mismatch")

    # Update order
    order_id = uuid.UUID(data.order_id)
    result = await db.execute(select(Order).where(Order.id == order_id, Order.user_id == user.id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "confirmed"
    order.payment_status = "paid"
    order.payment_id = data.razorpay_payment_id
    order.confirmed_at = datetime.now(timezone.utc)

    # Update payment record
    pay_result = await db.execute(
        select(Payment).where(Payment.gateway_order_id == data.razorpay_order_id)
    )
    payment = pay_result.scalar_one_or_none()
    if payment:
        payment.gateway_payment_id = data.razorpay_payment_id
        payment.gateway_signature = data.razorpay_signature
        payment.status = "success"

    await db.flush()

    return {
        "verified": True,
        "order_id": str(order.id),
        "order_number": order.order_number,
        "status": "paid",
    }


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: DbSession):
    """Handle Razorpay webhook events (payment.captured, payment.failed, etc.)."""
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay not configured")

    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    event_id = request.headers.get("X-Razorpay-Event-Id", "")

    # Verify webhook signature
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", RAZORPAY_KEY_SECRET)
    expected_signature = hmac.new(
        webhook_secret.encode("utf-8"), body, hashlib.sha256
    ).hexdigest()

    if expected_signature != signature:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    payload = await request.json()
    event = payload.get("event", "")
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})

    rz_order_id = payment_entity.get("order_id")
    rz_payment_id = payment_entity.get("id")

    if not rz_order_id:
        return {"status": "ignored", "reason": "no order_id in payload"}

    # Find the payment record
    pay_result = await db.execute(
        select(Payment).where(Payment.gateway_order_id == rz_order_id)
    )
    payment = pay_result.scalar_one_or_none()
    if not payment:
        return {"status": "ignored", "reason": "payment record not found"}

    # Find the order
    order_result = await db.execute(select(Order).where(Order.id == payment.order_id))
    order = order_result.scalar_one_or_none()
    if not order:
        return {"status": "ignored", "reason": "order not found"}

    if event == "payment.captured":
        order.payment_status = "paid"
        order.status = "confirmed"
        order.payment_id = rz_payment_id
        order.confirmed_at = datetime.now(timezone.utc)
        payment.gateway_payment_id = rz_payment_id
        payment.status = "success"
    elif event == "payment.failed":
        order.payment_status = "failed"
        payment.status = "failed"
    elif event == "refund.created":
        order.payment_status = "refunded"
        order.status = "refunded"
        payment.status = "refunded"

    await db.flush()
    return {"status": "processed", "event": event}


@router.get("/my-orders")
async def get_my_orders(db: DbSession, user: CurrentUser):
    """Get current user's order history."""
    result = await db.execute(
        select(Order)
        .where(Order.user_id == user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()

    return [
        {
            "id": str(o.id),
            "order_number": o.order_number,
            "status": o.status,
            "payment_status": o.payment_status,
            "subtotal": float(o.subtotal),
            "tax_amount": float(o.tax_amount),
            "total_amount": float(o.total_amount),
            "payment_method": o.payment_method,
            "created_at": o.created_at.isoformat(),
            "confirmed_at": o.confirmed_at.isoformat() if o.confirmed_at else None,
            "shipped_at": o.shipped_at.isoformat() if o.shipped_at else None,
            "delivered_at": o.delivered_at.isoformat() if o.delivered_at else None,
            "items": [
                {
                    "id": str(item.id),
                    "product_name": item.product_name,
                    "product_sku": item.product_sku,
                    "product_image": item.product_image,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price),
                    "total_price": float(item.total_price),
                }
                for item in o.items
            ],
        }
        for o in orders
    ]


@router.get("/{order_id}")
async def get_order_detail(order_id: str, db: DbSession, user: CurrentUser):
    """Get single order details."""
    result = await db.execute(
        select(Order)
        .where(Order.id == uuid.UUID(order_id), Order.user_id == user.id)
        .options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "status": order.status,
        "payment_status": order.payment_status,
        "subtotal": float(order.subtotal),
        "tax_amount": float(order.tax_amount),
        "shipping_amount": float(order.shipping_amount),
        "discount_amount": float(order.discount_amount),
        "total_amount": float(order.total_amount),
        "payment_method": order.payment_method,
        "shipping_name": order.shipping_name,
        "shipping_phone": order.shipping_phone,
        "shipping_city": order.shipping_city,
        "shipping_state": order.shipping_state,
        "shipping_postal_code": order.shipping_postal_code,
        "customer_note": order.customer_note,
        "created_at": order.created_at.isoformat(),
        "confirmed_at": order.confirmed_at.isoformat() if order.confirmed_at else None,
        "shipped_at": order.shipped_at.isoformat() if order.shipped_at else None,
        "delivered_at": order.delivered_at.isoformat() if order.delivered_at else None,
        "items": [
            {
                "id": str(item.id),
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "product_image": item.product_image,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
            }
            for item in order.items
        ],
    }

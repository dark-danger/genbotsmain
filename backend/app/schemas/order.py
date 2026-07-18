"""Order schemas."""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(..., ge=1)

class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_address_id: UUID
    billing_address_id: Optional[UUID] = None
    payment_method: str = "razorpay"
    coupon_code: Optional[str] = None
    customer_note: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: UUID
    product_name: str
    product_sku: str
    product_image: Optional[str] = None
    variant_name: Optional[str] = None
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    model_config = {"from_attributes": True}

class OrderResponse(BaseModel):
    id: UUID
    order_number: str
    status: str
    payment_status: str
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    coupon_code: Optional[str] = None
    payment_method: Optional[str] = None
    shipping_name: str
    shipping_city: str
    shipping_state: str
    customer_note: Optional[str] = None
    items: list[OrderItemResponse] = []
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class OrderStatusUpdate(BaseModel):
    status: str
    admin_note: Optional[str] = None

class CouponCreate(BaseModel):
    code: str = Field(..., max_length=50)
    description: Optional[str] = None
    discount_type: str
    discount_value: Decimal
    min_order_amount: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    max_uses: Optional[int] = None
    is_active: bool = True
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class CouponResponse(BaseModel):
    id: UUID
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: Decimal
    min_order_amount: Optional[Decimal] = None
    max_discount_amount: Optional[Decimal] = None
    max_uses: Optional[int] = None
    used_count: int
    is_active: bool
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    model_config = {"from_attributes": True}

"""Cart API endpoints - manage shopping cart items."""
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import DbSession, CurrentUser
from app.models.product import CartItem, Product

router = APIRouter(prefix="/cart", tags=["Cart"])


class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1
    variant_id: str | None = None


class UpdateCartItemRequest(BaseModel):
    quantity: int


@router.get("")
async def get_cart(db: DbSession, user: CurrentUser):
    """Get current user's cart items with product details."""
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user.id)
        .options(selectinload(CartItem.product), selectinload(CartItem.variant))
        .order_by(CartItem.created_at.desc())
    )
    items = result.scalars().all()

    cart_items = []
    total = 0
    for item in items:
        price = float(item.variant.price) if item.variant and item.variant.price else float(item.product.price)
        item_total = price * item.quantity
        total += item_total
        cart_items.append({
            "id": str(item.id),
            "product_id": str(item.product_id),
            "variant_id": str(item.variant_id) if item.variant_id else None,
            "quantity": item.quantity,
            "product_name": item.product.name,
            "product_slug": item.product.slug,
            "product_sku": item.product.sku,
            "product_image": item.product.images[0].url if item.product.images else None,
            "unit_price": price,
            "total_price": item_total,
            "stock_available": item.product.stock_quantity,
            "variant_name": item.variant.name if item.variant else None,
        })

    return {
        "items": cart_items,
        "item_count": sum(i["quantity"] for i in cart_items),
        "subtotal": total,
        "tax_rate": 18,
        "tax_amount": round(total * 0.18, 2),
        "total": round(total * 1.18, 2),
    }


@router.post("/items", status_code=status.HTTP_201_CREATED)
async def add_to_cart(data: AddToCartRequest, db: DbSession, user: CurrentUser):
    """Add a product to cart. If already in cart, increment quantity."""
    product_id = UUID(data.product_id)

    # Verify product exists and is active
    result = await db.execute(select(Product).where(Product.id == product_id, Product.status == "active"))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unavailable")

    if data.quantity > product.stock_quantity:
        raise HTTPException(status_code=400, detail=f"Only {product.stock_quantity} items in stock")

    # Check if already in cart
    existing = await db.execute(
        select(CartItem).where(
            CartItem.user_id == user.id,
            CartItem.product_id == product_id,
            CartItem.variant_id == (UUID(data.variant_id) if data.variant_id else None),
        )
    )
    cart_item = existing.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += data.quantity
        if cart_item.quantity > product.stock_quantity:
            cart_item.quantity = product.stock_quantity
    else:
        cart_item = CartItem(
            user_id=user.id,
            product_id=product_id,
            variant_id=UUID(data.variant_id) if data.variant_id else None,
            quantity=data.quantity,
        )
        db.add(cart_item)

    await db.flush()
    return {"message": "Item added to cart", "item_id": str(cart_item.id), "quantity": cart_item.quantity}


@router.put("/items/{item_id}")
async def update_cart_item(item_id: UUID, data: UpdateCartItemRequest, db: DbSession, user: CurrentUser):
    """Update quantity of a cart item."""
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user.id)
        .options(selectinload(CartItem.product))
    )
    cart_item = result.scalar_one_or_none()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if data.quantity <= 0:
        await db.delete(cart_item)
        await db.flush()
        return {"message": "Item removed from cart"}

    if data.quantity > cart_item.product.stock_quantity:
        raise HTTPException(status_code=400, detail=f"Only {cart_item.product.stock_quantity} items in stock")

    cart_item.quantity = data.quantity
    await db.flush()
    return {"message": "Cart updated", "quantity": cart_item.quantity}


@router.delete("/items/{item_id}")
async def remove_from_cart(item_id: UUID, db: DbSession, user: CurrentUser):
    """Remove a specific item from cart."""
    result = await db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user.id)
    )
    cart_item = result.scalar_one_or_none()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(cart_item)
    await db.flush()
    return {"message": "Item removed from cart"}


@router.delete("")
async def clear_cart(db: DbSession, user: CurrentUser):
    """Clear all items from cart."""
    result = await db.execute(select(CartItem).where(CartItem.user_id == user.id))
    items = result.scalars().all()
    for item in items:
        await db.delete(item)
    await db.flush()
    return {"message": "Cart cleared"}

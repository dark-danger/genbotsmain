"""Wishlist API endpoints - manage user's liked/saved products."""
from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.deps import DbSession, CurrentUser
from app.models.product import Wishlist, Product

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


class WishlistToggleRequest(BaseModel):
    product_id: str


@router.get("")
async def get_wishlist(db: DbSession, user: CurrentUser):
    """Get current user's wishlist with product details."""
    result = await db.execute(
        select(Wishlist)
        .where(Wishlist.user_id == user.id)
        .options(selectinload(Wishlist.product))
        .order_by(Wishlist.created_at.desc())
    )
    items = result.scalars().all()

    return {
        "items": [
            {
                "id": str(item.id),
                "product_id": str(item.product_id),
                "product_name": item.product.name,
                "product_slug": item.product.slug,
                "product_price": float(item.product.price),
                "product_compare_price": float(item.product.compare_at_price) if item.product.compare_at_price else None,
                "product_image": item.product.images[0].url if item.product.images else None,
                "in_stock": item.product.stock_quantity > 0,
                "added_at": item.created_at.isoformat(),
            }
            for item in items
        ],
        "count": len(items),
    }


@router.post("", status_code=status.HTTP_200_OK)
async def toggle_wishlist(data: WishlistToggleRequest, db: DbSession, user: CurrentUser):
    """Toggle a product in/out of wishlist. Returns whether item is now wishlisted."""
    product_id = UUID(data.product_id)

    # Verify product exists
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == user.id,
            Wishlist.product_id == product_id,
        )
    )
    wishlist_item = existing.scalar_one_or_none()

    if wishlist_item:
        # Remove from wishlist
        await db.delete(wishlist_item)
        await db.flush()
        return {"wishlisted": False, "message": "Removed from wishlist"}
    else:
        # Add to wishlist
        new_item = Wishlist(user_id=user.id, product_id=product_id)
        db.add(new_item)
        await db.flush()
        return {"wishlisted": True, "message": "Added to wishlist"}


@router.delete("/{product_id}")
async def remove_from_wishlist(product_id: UUID, db: DbSession, user: CurrentUser):
    """Remove a specific product from wishlist."""
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == user.id,
            Wishlist.product_id == product_id,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")

    await db.delete(item)
    await db.flush()
    return {"message": "Removed from wishlist"}


@router.get("/check/{product_id}")
async def check_wishlist(product_id: UUID, db: DbSession, user: CurrentUser):
    """Check if a product is in user's wishlist."""
    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == user.id,
            Wishlist.product_id == product_id,
        )
    )
    item = result.scalar_one_or_none()
    return {"wishlisted": item is not None}

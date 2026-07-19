"""Product API endpoints with full CRUD and search."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import DbSession, AdminUser, OptionalUser
from app.schemas.product import (
    ProductCreate, ProductResponse, ProductListResponse,
    CategoryCreate, CategoryResponse,
    BrandCreate, BrandResponse,
    ReviewCreate, ReviewResponse,
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.product_service import ProductService
from app.utils.audit import log_audit_action

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedResponse[ProductListResponse])
async def list_products(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    featured: bool = False,
    status: str = "active",
):
    """List products with filtering, search, and pagination."""
    service = ProductService(db)
    result = await service.list_products(
        page=page, page_size=page_size,
        category_slug=category, brand_slug=brand,
        search=search, min_price=min_price, max_price=max_price,
        sort_by=sort_by, sort_order=sort_order, featured_only=featured,
        status=status,
    )
    return result


@router.get("/featured", response_model=list[ProductListResponse])
async def get_featured_products(db: DbSession, limit: int = Query(8, ge=1, le=20)):
    """Get featured products for homepage."""
    service = ProductService(db)
    return await service.get_featured_products(limit)


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str, db: DbSession):
    """Get product details by slug."""
    service = ProductService(db)
    product = await service.get_product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate, db: DbSession, admin: AdminUser):
    """Create a new product (admin only)."""
    if data.status == "published":
        data.status = "active"
    service = ProductService(db)
    product = await service.create_product(data)
    await log_audit_action(
        db,
        user_id=admin.id,
        action="create_product",
        resource_type="product",
        resource_id=product.id,
        details={"name": product.name, "sku": product.sku}
    )
    return product


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: UUID, data: dict, db: DbSession, admin: AdminUser):
    """Update a product (admin only)."""
    if data.get("status") == "published":
        data["status"] = "active"
    service = ProductService(db)
    product = await service.update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await log_audit_action(
        db,
        user_id=admin.id,
        action="update_product",
        resource_type="product",
        resource_id=product.id,
        details={"updates": data}
    )
    return product


@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(product_id: UUID, db: DbSession, admin: AdminUser):
    """Delete a product (admin only)."""
    service = ProductService(db)
    deleted = await service.delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    await log_audit_action(
        db,
        user_id=admin.id,
        action="delete_product",
        resource_type="product",
        resource_id=product_id
    )
    return MessageResponse(message="Product deleted successfully")

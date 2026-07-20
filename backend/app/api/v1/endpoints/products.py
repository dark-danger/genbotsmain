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
from app.utils.cache import global_cache

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
    cache_key = f"list_products:{page}:{page_size}:{category}:{brand}:{search}:{min_price}:{max_price}:{sort_by}:{sort_order}:{featured}:{status}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    service = ProductService(db)
    result = await service.list_products(
        page=page, page_size=page_size,
        category_slug=category, brand_slug=brand,
        search=search, min_price=min_price, max_price=max_price,
        sort_by=sort_by, sort_order=sort_order, featured_only=featured,
        status=status,
    )
    # Serialize items for caching to avoid DetachedInstanceError
    result["items"] = [ProductListResponse.model_validate(p).model_dump() for p in result["items"]]
    global_cache.set(cache_key, result, ttl=30.0)
    return result


@router.get("/featured", response_model=list[ProductListResponse])
async def get_featured_products(db: DbSession, limit: int = Query(8, ge=1, le=20)):
    """Get featured products for homepage."""
    cache_key = f"featured_products:{limit}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    service = ProductService(db)
    products = await service.get_featured_products(limit)
    serialized = [ProductListResponse.model_validate(p).model_dump() for p in products]
    global_cache.set(cache_key, serialized, ttl=60.0)
    return serialized


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str, db: DbSession):
    """Get product details by slug."""
    cache_key = f"product:{slug}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    service = ProductService(db)
    product = await service.get_product_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    serialized = ProductResponse.model_validate(product).model_dump()
    global_cache.set(cache_key, serialized, ttl=30.0)
    return serialized


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate, db: DbSession, admin: AdminUser):
    """Create a new product (admin only)."""
    if data.status == "published":
        data.status = "active"
    service = ProductService(db)
    product = await service.create_product(data)
    
    # Invalidate cache on modification
    global_cache.clear()
    
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
    
    # Invalidate cache on modification
    global_cache.clear()
    
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
    
    # Invalidate cache on modification
    global_cache.clear()
    
    await log_audit_action(
        db,
        user_id=admin.id,
        action="delete_product",
        resource_type="product",
        resource_id=product_id
    )
    return MessageResponse(message="Product deleted successfully")

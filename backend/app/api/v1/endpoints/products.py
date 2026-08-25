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


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: DbSession):
    """List all active product categories."""
    from sqlalchemy import select
    from app.models.product import Category
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.sort_order.asc(), Category.name.asc())
    )
    return result.scalars().all()


@router.get("/brands", response_model=list[BrandResponse])
async def list_brands(db: DbSession):
    """List all active brands."""
    from sqlalchemy import select
    from app.models.product import Brand
    result = await db.execute(
        select(Brand)
        .where(Brand.is_active == True)
        .order_by(Brand.name.asc())
    )
    return result.scalars().all()


@router.post("/sync-school-lab", status_code=status.HTTP_200_OK)
@router.get("/sync-school-lab", status_code=status.HTTP_200_OK)
async def sync_school_lab_products(db: DbSession):
    """Seed and sync all official GenBots School Lab products into the catalog."""
    from slugify import slugify
    import uuid
    from app.models.product import ProductImage, ProductSpecification

    # 1. Fetch Categories
    cat_res = await db.execute(select(Category))
    categories = {c.slug: c.id for c in cat_res.scalars().all()}

    # 2. Fetch Brand
    brand_res = await db.execute(select(Brand).limit(1))
    brand = brand_res.scalar_one_or_none()
    brand_id = brand.id if brand else None

    synced_count = 0
    for p_data in SCHOOL_LAB_DATA:
        p_slug = slugify(p_data["name"])
        cat_id = categories.get(p_data["category_slug"])
        
        # Check if already exists by slug or name
        existing_res = await db.execute(select(Product).options(selectinload(Product.images)).where(Product.slug == p_slug))
        product = existing_res.scalar_one_or_none()

        if not product:
            existing_by_name = await db.execute(select(Product).options(selectinload(Product.images)).where(Product.name == p_data["name"]))
            product = existing_by_name.scalar_one_or_none()

        if product:
            # Update existing
            product.price = p_data["price"]
            product.description = p_data["desc"]
            product.short_description = p_data["desc"][:200]
            product.category_id = cat_id or product.category_id
            product.status = "active"
            product.stock_quantity = 100
            
            # Update or add primary image
            if not product.images:
                img = ProductImage(
                    product_id=product.id,
                    url=p_data["image"],
                    alt_text=p_data["name"],
                    is_primary=True,
                    sort_order=0
                )
                db.add(img)
            else:
                product.images[0].url = p_data["image"]
        else:
            # Create new
            product = Product(
                id=uuid.uuid4(),
                name=p_data["name"],
                slug=p_slug,
                sku=f"GEN-{slugify(p_data['name'])[:10].upper()}-{uuid.uuid4().hex[:4].upper()}",
                description=p_data["desc"],
                short_description=p_data["desc"][:200],
                category_id=cat_id,
                brand_id=brand_id,
                price=p_data["price"],
                compare_at_price=round(p_data["price"] * 1.25, 2),
                stock_quantity=100,
                status="active",
                is_featured=p_data["price"] >= 1000 or "Arduino" in p_data["name"] or "ESP32" in p_data["name"],
                tax_rate=18.00,
            )
            db.add(product)
            await db.flush()

            img = ProductImage(
                product_id=product.id,
                url=p_data["image"],
                alt_text=p_data["name"],
                is_primary=True,
                sort_order=0
            )
            db.add(img)

        synced_count += 1

    await db.flush()
    global_cache.clear()
    return {"message": f"Successfully created and synced all {synced_count} school lab products in the store!", "count": synced_count}


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str, db: DbSession):
    """Get product details by slug or ID."""
    cache_key = f"product:{slug}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    service = ProductService(db)
    product = await service.get_product_by_slug_or_id(slug)
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





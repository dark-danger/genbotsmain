"""Product service with CRUD, search, filtering, and pagination."""
from typing import Optional
from uuid import UUID

from slugify import slugify
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import (
    Product, ProductImage, ProductVariant, ProductSpecification,
    Category, Brand, Review,
)
from app.schemas.product import ProductCreate


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _generate_unique_slug(self, base_name: str, requested_slug: Optional[str] = None) -> str:
        raw_slug = requested_slug or slugify(base_name or "product")
        if not raw_slug:
            raw_slug = "product"
        slug = raw_slug
        counter = 1
        while True:
            existing = await self.db.execute(select(Product.id).where(Product.slug == slug))
            if not existing.scalar_one_or_none():
                return slug
            slug = f"{raw_slug}-{counter}"
            counter += 1

    async def _generate_unique_sku(self, requested_sku: Optional[str] = None) -> str:
        from uuid import uuid4
        base_sku = (requested_sku or "").strip()
        if not base_sku:
            base_sku = f"GEN-{uuid4().hex[:6].upper()}"
        sku = base_sku
        counter = 1
        while True:
            existing = await self.db.execute(select(Product.id).where(Product.sku == sku))
            if not existing.scalar_one_or_none():
                return sku
            sku = f"{base_sku}-{counter}"
            counter += 1

    async def create_product(self, data: ProductCreate) -> Product:
        slug = await self._generate_unique_slug(data.name, data.slug)
        sku = await self._generate_unique_sku(data.sku)

        product = Product(
            name=data.name, slug=slug, sku=sku,
            description=data.description, short_description=data.short_description,
            category_id=data.category_id, brand_id=data.brand_id,
            price=data.price, compare_at_price=data.compare_at_price,
            cost_price=data.cost_price, wholesale_price=data.wholesale_price,
            bulk_price=data.bulk_price, bulk_min_quantity=data.bulk_min_quantity,
            tax_rate=data.tax_rate, stock_quantity=data.stock_quantity,
            low_stock_threshold=data.low_stock_threshold,
            track_inventory=data.track_inventory, allow_backorder=data.allow_backorder,
            weight=data.weight, dimensions=data.dimensions,
            status=data.status, is_featured=data.is_featured,
            is_digital=data.is_digital, meta_title=data.meta_title,
            meta_description=data.meta_description, tags=data.tags,
            warranty_info=data.warranty_info, return_policy=data.return_policy,
            shipping_info=data.shipping_info,
        )
        self.db.add(product)
        await self.db.flush()

        for img_data in data.images:
            img = ProductImage(
                product_id=product.id, url=img_data.url,
                alt_text=img_data.alt_text, is_primary=img_data.is_primary,
                sort_order=img_data.sort_order,
            )
            self.db.add(img)

        for var_data in data.variants:
            var = ProductVariant(
                product_id=product.id, name=var_data.name,
                sku=var_data.sku, price=var_data.price,
                stock_quantity=var_data.stock_quantity,
                attributes=var_data.attributes, is_active=var_data.is_active,
            )
            self.db.add(var)

        for spec_data in data.specifications:
            spec = ProductSpecification(
                product_id=product.id, key=spec_data.key,
                value=spec_data.value, sort_order=spec_data.sort_order,
            )
            self.db.add(spec)

        await self.db.flush()
        return await self.get_product_by_id(product.id)

    async def get_product_by_slug(self, slug: str) -> Optional[Product]:
        result = await self.db.execute(
            select(Product)
            .options(
                selectinload(Product.images),
                selectinload(Product.variants),
                selectinload(Product.specifications),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
            .where(Product.slug == slug, Product.status == "active")
        )
        product = result.scalar_one_or_none()
        if product:
            product.view_count += 1
            await self.db.flush()
        return product

    async def get_product_by_id(self, product_id: UUID) -> Optional[Product]:
        result = await self.db.execute(
            select(Product)
            .options(
                selectinload(Product.images),
                selectinload(Product.variants),
                selectinload(Product.specifications),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
            .where(Product.id == product_id)
        )
        return result.scalar_one_or_none()

    async def list_products(
        self,
        page: int = 1,
        page_size: int = 20,
        category_slug: Optional[str] = None,
        brand_slug: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        featured_only: bool = False,
        status: str = "active",
    ):
        query = select(Product).options(
            selectinload(Product.images),
            selectinload(Product.category),
            selectinload(Product.brand),
        ).where(Product.status == status)

        if category_slug:
            query = query.join(Category).where(Category.slug == category_slug)
        if brand_slug:
            query = query.join(Brand).where(Brand.slug == brand_slug)
        if search:
            query = query.where(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                )
            )
        if min_price is not None:
            query = query.where(Product.price >= min_price)
        if max_price is not None:
            query = query.where(Product.price <= max_price)
        if featured_only:
            query = query.where(Product.is_featured == True)

        # Count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()

        # Sort
        sort_column = getattr(Product, sort_by, Product.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # Paginate
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        products = result.scalars().all()

        return {
            "items": products,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    async def update_product(self, product_id: UUID, data: dict) -> Optional[Product]:
        product = await self.get_product_by_id(product_id)
        if not product:
            return None

        # Extract relationship data
        images_data = data.pop("images", None)
        variants_data = data.pop("variants", None)
        specifications_data = data.pop("specifications", None)

        # Ignore relationship objects and read-only attributes that cannot be updated directly
        IGNORED_KEYS = {
            "id", "category", "brand", "reviews", "images", "variants", "specifications",
            "created_at", "updated_at", "view_count", "sold_count", "avg_rating", "review_count"
        }

        for key, value in data.items():
            if key in IGNORED_KEYS:
                continue
            if not hasattr(product, key):
                continue
            
            # Handle category_id / brand_id string to UUID conversion
            if key in ("category_id", "brand_id") and isinstance(value, str):
                try:
                    value = UUID(value)
                except ValueError:
                    value = None

            if value is not None:
                setattr(product, key, value)

        from sqlalchemy import delete

        if images_data is not None:
            await self.db.execute(delete(ProductImage).where(ProductImage.product_id == product_id))
            for img in images_data:
                if isinstance(img, dict) and img.get("url"):
                    new_img = ProductImage(
                        product_id=product_id,
                        url=img["url"],
                        alt_text=img.get("alt_text"),
                        is_primary=img.get("is_primary", False),
                        sort_order=img.get("sort_order", 0)
                    )
                    self.db.add(new_img)
                elif hasattr(img, "url"):
                    new_img = ProductImage(
                        product_id=product_id,
                        url=img.url,
                        alt_text=getattr(img, "alt_text", None),
                        is_primary=getattr(img, "is_primary", False),
                        sort_order=getattr(img, "sort_order", 0)
                    )
                    self.db.add(new_img)

        if specifications_data is not None:
            await self.db.execute(delete(ProductSpecification).where(ProductSpecification.product_id == product_id))
            for spec in specifications_data:
                if isinstance(spec, dict) and spec.get("key") and spec.get("value"):
                    new_spec = ProductSpecification(
                        product_id=product_id,
                        key=spec["key"],
                        value=spec["value"],
                        sort_order=spec.get("sort_order", 0)
                    )
                    self.db.add(new_spec)

        if variants_data is not None:
            await self.db.execute(delete(ProductVariant).where(ProductVariant.product_id == product_id))
            for var in variants_data:
                if isinstance(var, dict) and var.get("name"):
                    new_var = ProductVariant(
                        product_id=product_id,
                        name=var["name"],
                        sku=var.get("sku"),
                        price=var.get("price"),
                        stock_quantity=var.get("stock_quantity", 0),
                        attributes=var.get("attributes"),
                        is_active=var.get("is_active", True)
                    )
                    self.db.add(new_var)

        await self.db.flush()
        return await self.get_product_by_id(product_id)

    async def delete_product(self, product_id: UUID) -> bool:
        from app.models.product import CartItem, Wishlist
        from sqlalchemy import delete
        product = await self.get_product_by_id(product_id)
        if not product:
            return False
        await self.db.execute(delete(CartItem).where(CartItem.product_id == product_id))
        await self.db.execute(delete(Wishlist).where(Wishlist.product_id == product_id))
        await self.db.delete(product)
        await self.db.flush()
        return True

    async def get_featured_products(self, limit: int = 8):
        result = await self.db.execute(
            select(Product)
            .options(
                selectinload(Product.images),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
            .where(Product.status == "active", Product.is_featured == True)
            .order_by(Product.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

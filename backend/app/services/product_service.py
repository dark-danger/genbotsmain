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

    async def create_product(self, data: ProductCreate) -> Product:
        slug = data.slug or slugify(data.name)
        product = Product(
            name=data.name, slug=slug, sku=data.sku,
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
        return product

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
        for key, value in data.items():
            if hasattr(product, key) and value is not None:
                setattr(product, key, value)
        await self.db.flush()
        return product

    async def delete_product(self, product_id: UUID) -> bool:
        product = await self.get_product_by_id(product_id)
        if not product:
            return False
        await self.db.delete(product)
        await self.db.flush()
        return True

    async def get_featured_products(self, limit: int = 8):
        result = await self.db.execute(
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.status == "active", Product.is_featured == True)
            .order_by(Product.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()

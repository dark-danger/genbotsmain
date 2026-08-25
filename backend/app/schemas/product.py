"""Pydantic schemas for products, categories, brands."""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=200)
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_active: bool = True
    sort_order: int = 0
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[UUID] = None
    is_active: bool
    sort_order: int
    created_at: datetime
    model_config = {"from_attributes": True}

class CategoryTree(CategoryResponse):
    children: list["CategoryTree"] = []

class BrandCreate(BaseModel):
    name: str = Field(..., max_length=200)
    slug: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    is_active: bool = True

class BrandResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class ProductImageSchema(BaseModel):
    url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0

class ProductVariantSchema(BaseModel):
    name: str
    sku: str
    price: Optional[Decimal] = None
    stock_quantity: int = 0
    attributes: Optional[dict] = None
    is_active: bool = True

class ProductSpecSchema(BaseModel):
    key: str
    value: str
    sort_order: int = 0

class ProductCreate(BaseModel):
    name: str = Field(..., max_length=300)
    slug: Optional[str] = None
    sku: str = Field(..., max_length=100)
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    price: Decimal
    compare_at_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    wholesale_price: Optional[Decimal] = None
    bulk_price: Optional[Decimal] = None
    bulk_min_quantity: Optional[int] = None
    tax_rate: Decimal = Decimal("18.00")
    stock_quantity: int = 0
    low_stock_threshold: int = 5
    track_inventory: bool = True
    allow_backorder: bool = False
    weight: Optional[float] = None
    dimensions: Optional[dict] = None
    status: str = "draft"
    is_featured: bool = False
    is_digital: bool = False
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    tags: Optional[list[str]] = None
    warranty_info: Optional[str] = None
    return_policy: Optional[str] = None
    shipping_info: Optional[str] = None
    images: list[ProductImageSchema] = []
    variants: list[ProductVariantSchema] = []
    specifications: list[ProductSpecSchema] = []

class ProductImageResponse(BaseModel):
    id: Optional[UUID] = None
    url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0
    model_config = {"from_attributes": True}

class ProductVariantResponse(BaseModel):
    id: Optional[UUID] = None
    name: str
    sku: str
    price: Optional[Decimal] = None
    stock_quantity: int = 0
    attributes: Optional[dict] = None
    is_active: bool = True
    model_config = {"from_attributes": True}

class ProductSpecResponse(BaseModel):
    id: Optional[UUID] = None
    key: str
    value: str
    sort_order: int = 0
    model_config = {"from_attributes": True}

class ProductResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    sku: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    price: Decimal
    compare_at_price: Optional[Decimal] = None
    stock_quantity: int = 0
    status: str = "active"
    is_featured: bool = False
    is_digital: bool = False
    tags: Optional[list[str]] = None
    avg_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    view_count: Optional[int] = 0
    sold_count: Optional[int] = 0
    warranty_info: Optional[str] = None
    images: list[ProductImageResponse] = []
    variants: list[ProductVariantResponse] = []
    specifications: list[ProductSpecResponse] = []
    category: Optional[CategoryResponse] = None
    brand: Optional[BrandResponse] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

    @property
    def primary_image(self) -> Optional[str]:
        for img in self.images:
            if img.is_primary:
                return img.url
        return self.images[0].url if self.images else None

class ProductListResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    sku: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    brand_id: Optional[UUID] = None
    price: Decimal
    compare_at_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = Decimal("18.00")
    stock_quantity: int = 0
    low_stock_threshold: Optional[int] = 5
    weight: Optional[float] = None
    dimensions: Optional[dict] = None
    status: str = "active"
    is_featured: bool = False
    is_digital: Optional[bool] = False
    tags: Optional[list[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    warranty_info: Optional[str] = None
    return_policy: Optional[str] = None
    shipping_info: Optional[str] = None
    avg_rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    images: list[ProductImageResponse] = []
    specifications: list[ProductSpecResponse] = []
    variants: list[ProductVariantResponse] = []
    category: Optional[CategoryResponse] = None
    brand: Optional[BrandResponse] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

    @property
    def primary_image(self) -> Optional[str]:
        for img in self.images:
            if img.is_primary:
                return img.url
        return self.images[0].url if self.images else None

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: UUID
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    is_verified_purchase: bool
    is_approved: bool
    user: Optional["ReviewUserResponse"] = None
    created_at: datetime
    model_config = {"from_attributes": True}

class ReviewUserResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    model_config = {"from_attributes": True}

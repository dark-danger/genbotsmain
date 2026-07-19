"""Product, Category, Brand, and related e-commerce models."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, Numeric, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    icon = Column(String(100), nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Self-referential relationship for category tree
    parent = relationship("Category", remote_side="Category.id", backref="children")
    products = relationship("Product", back_populates="category")


class Brand(Base):
    __tablename__ = "brands"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    products = relationship("Product", back_populates="brand")


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True)

    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2), nullable=True)
    cost_price = Column(Numeric(10, 2), nullable=True)
    wholesale_price = Column(Numeric(10, 2), nullable=True)
    bulk_price = Column(Numeric(10, 2), nullable=True)
    bulk_min_quantity = Column(Integer, nullable=True)
    tax_rate = Column(Numeric(5, 2), default=18.00)

    # Inventory
    stock_quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=5)
    track_inventory = Column(Boolean, default=True)
    allow_backorder = Column(Boolean, default=False)
    weight = Column(Float, nullable=True)
    dimensions = Column(JSON, nullable=True)  # {length, width, height}

    # Status
    status = Column(
        Enum("draft", "active", "inactive", "archived", name="product_status"),
        default="draft",
        nullable=False,
    )
    is_featured = Column(Boolean, default=False, nullable=False)
    is_digital = Column(Boolean, default=False, nullable=False)

    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)  # ["arduino", "sensor"]

    # Warranty & Shipping
    warranty_info = Column(Text, nullable=True)
    return_policy = Column(Text, nullable=True)
    shipping_info = Column(Text, nullable=True)

    # Stats
    view_count = Column(Integer, default=0)
    sold_count = Column(Integer, default=0)
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    category = relationship("Category", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    specifications = relationship("ProductSpecification", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    alt_text = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="images")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(100), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)
    stock_quantity = Column(Integer, default=0, nullable=False)
    attributes = Column(JSON, nullable=True)  # {"color": "red", "size": "L"}
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="variants")
    order_items = relationship("OrderItem", back_populates="variant")


class ProductSpecification(Base):
    __tablename__ = "product_specifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String(200), nullable=False)
    value = Column(String(500), nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="specifications")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="wishlists")
    product = relationship("Product")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User")
    product = relationship("Product")
    variant = relationship("ProductVariant")

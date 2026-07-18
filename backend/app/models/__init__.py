"""Models package - imports all models for Alembic discovery."""
from app.models.user import User, Address, UserSession
from app.models.product import (
    Category, Brand, Product, ProductImage, ProductVariant,
    ProductSpecification, Review, Wishlist,
)
from app.models.order import Order, OrderItem, Payment, Invoice, Shipping, Coupon
from app.models.content import (
    BlogCategory, BlogPost, BlogComment,
    Software, SoftwareVersion, SoftwareDownload,
    Project, Service, TrainingCourse, TrainingEnrollment,
)
from app.models.cms import (
    CmsPage, CmsSection, MediaFile, Testimonial, Partner, Client,
    Faq, Newsletter, SiteSetting, SocialLink,
    SupportTicket, TicketMessage, Notification,
    ContactInquiry, ConsultationBooking,
    AuditLog, ActivityLog, SeoMetadata,
    Career, JobApplication,
)

__all__ = [
    "User", "Address", "UserSession",
    "Category", "Brand", "Product", "ProductImage", "ProductVariant",
    "ProductSpecification", "Review", "Wishlist",
    "Order", "OrderItem", "Payment", "Invoice", "Shipping", "Coupon",
    "BlogCategory", "BlogPost", "BlogComment",
    "Software", "SoftwareVersion", "SoftwareDownload",
    "Project", "Service", "TrainingCourse", "TrainingEnrollment",
    "CmsPage", "CmsSection", "MediaFile", "Testimonial", "Partner", "Client",
    "Faq", "Newsletter", "SiteSetting", "SocialLink",
    "SupportTicket", "TicketMessage", "Notification",
    "ContactInquiry", "ConsultationBooking",
    "AuditLog", "ActivityLog", "SeoMetadata",
    "Career", "JobApplication",
]

"""Admin API endpoints - dashboard analytics and management."""
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.deps import DbSession, AdminUser
from app.models.user import User
from app.models.product import Product, Category, Brand
from app.models.order import Order, OrderItem, Coupon
from app.schemas.order import CouponCreate, CouponResponse
from app.models.content import BlogPost, Software, Project, Service, TrainingCourse
from app.models.cms import (
    Newsletter, ContactInquiry, SupportTicket, Testimonial, Partner, Client,
    Faq, MediaFile, AuditLog, Notification, Career, SiteSetting,
)
from app.schemas.auth import UserResponse, UserAdminUpdate
from app.schemas.common import MessageResponse
from app.utils.audit import log_audit_action

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def get_dashboard_stats(db: DbSession, admin: AdminUser):
    """Get admin dashboard analytics."""
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_products = (await db.execute(select(func.count(Product.id)))).scalar()
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar()
    total_revenue = (await db.execute(select(func.sum(Order.total_amount)).where(Order.payment_status == "paid"))).scalar() or 0
    pending_orders = (await db.execute(select(func.count(Order.id)).where(Order.status == "pending"))).scalar()
    total_blog_posts = (await db.execute(select(func.count(BlogPost.id)))).scalar()
    total_software = (await db.execute(select(func.count(Software.id)))).scalar()
    total_tickets = (await db.execute(select(func.count(SupportTicket.id)).where(SupportTicket.status == "open"))).scalar()
    total_subscribers = (await db.execute(select(func.count(Newsletter.id)))).scalar()
    total_inquiries = (await db.execute(select(func.count(ContactInquiry.id)).where(ContactInquiry.is_read == False))).scalar()

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "pending_orders": pending_orders,
        "total_blog_posts": total_blog_posts,
        "total_software": total_software,
        "open_tickets": total_tickets,
        "total_subscribers": total_subscribers,
        "unread_inquiries": total_inquiries,
    }


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: DbSession, admin: AdminUser,
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    role: str | None = None, search: str | None = None,
):
    """List all users with filtering."""
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if search:
        query = query.where(User.email.ilike(f"%{search}%"))
    query = query.order_by(User.created_at.desc()).offset((page-1)*page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: UUID, data: UserAdminUpdate, db: DbSession, admin: AdminUser):
    """Update user role/status (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.flush()
    await log_audit_action(
        db,
        user_id=admin.id,
        action="update_user",
        resource_type="user",
        resource_id=user_id,
        details={"updates": update_data}
    )
    return user


@router.get("/orders")
async def list_admin_orders(
    db: DbSession, admin: AdminUser,
    page: int = Query(1, ge=1), page_size: int = Query(20),
    status: str | None = None,
):
    """List all orders for admin."""
    query = select(Order).options(selectinload(Order.items), selectinload(Order.user))
    if status:
        query = query.where(Order.status == status)
    query = query.order_by(Order.created_at.desc()).offset((page-1)*page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: UUID, status: str, db: DbSession, admin: AdminUser):
    """Update order status."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    old_status = order.status
    order.status = status
    await db.flush()
    await log_audit_action(
        db,
        user_id=admin.id,
        action="update_order_status",
        resource_type="order",
        resource_id=order_id,
        details={"old_status": old_status, "new_status": status}
    )
    return {"message": "Order status updated", "status": status}


@router.get("/inquiries")
async def list_inquiries(db: DbSession, admin: AdminUser):
    """List contact inquiries."""
    result = await db.execute(select(ContactInquiry).order_by(ContactInquiry.created_at.desc()))
    return result.scalars().all()


@router.get("/tickets")
async def list_all_tickets(db: DbSession, admin: AdminUser, status: str | None = None):
    """List all support tickets."""
    query = select(SupportTicket).options(selectinload(SupportTicket.user))
    if status:
        query = query.where(SupportTicket.status == status)
    result = await db.execute(query.order_by(SupportTicket.created_at.desc()))
    return result.scalars().all()


from app.schemas.audit import AuditLogResponse

@router.get("/subscribers")
async def list_subscribers(db: DbSession, admin: AdminUser):
    """List newsletter subscribers."""
    result = await db.execute(select(Newsletter).order_by(Newsletter.subscribed_at.desc()))
    return result.scalars().all()


@router.get("/logs", response_model=list[AuditLogResponse])
async def list_audit_logs(
    db: DbSession,
    admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: UUID | None = None,
    action: str | None = None,
    resource_type: str | None = None,
):
    """List audit logs with filtering."""
    query = select(AuditLog)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    if action:
        query = query.where(AuditLog.action == action)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    
    query = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/coupons", response_model=list[CouponResponse])
async def list_coupons(db: DbSession, admin: AdminUser):
    """List all coupons."""
    result = await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))
    return result.scalars().all()


@router.post("/coupons", response_model=CouponResponse, status_code=201)
async def create_coupon(data: CouponCreate, db: DbSession, admin: AdminUser):
    """Create a coupon."""
    coupon = Coupon(**data.model_dump(exclude_unset=True))
    db.add(coupon)
    await db.flush()
    await log_audit_action(
        db,
        user_id=admin.id,
        action="create_coupon",
        resource_type="coupon",
        resource_id=coupon.id,
        details={"code": coupon.code}
    )
    return coupon


@router.put("/coupons/{id}", response_model=CouponResponse)
async def update_coupon(id: UUID, data: CouponCreate, db: DbSession, admin: AdminUser):
    """Update a coupon."""
    result = await db.execute(select(Coupon).where(Coupon.id == id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(coupon, k, v)
    await db.flush()
    await log_audit_action(
        db,
        user_id=admin.id,
        action="update_coupon",
        resource_type="coupon",
        resource_id=coupon.id,
        details={"code": coupon.code}
    )
    return coupon


@router.delete("/coupons/{id}", response_model=MessageResponse)
async def delete_coupon(id: UUID, db: DbSession, admin: AdminUser):
    """Delete a coupon."""
    result = await db.execute(select(Coupon).where(Coupon.id == id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    await db.delete(coupon)
    await db.flush()
    await log_audit_action(
        db,
        user_id=admin.id,
        action="delete_coupon",
        resource_type="coupon",
        resource_id=id,
        details={"code": coupon.code}
    )
    return MessageResponse(message="Coupon deleted successfully")


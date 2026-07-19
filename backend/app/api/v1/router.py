"""API v1 router - aggregates all endpoint modules."""
from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.products import router as products_router
from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.content import (
    blog_router, software_router, services_router,
    projects_router, training_router, cms_router,
    public_router, careers_router, support_router,
)
from app.api.v1.endpoints.orders import router as orders_router
from app.api.v1.endpoints.cart import router as cart_router
from app.api.v1.endpoints.wishlist import router as wishlist_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(admin_router)
api_router.include_router(orders_router)
api_router.include_router(cart_router)
api_router.include_router(wishlist_router)
api_router.include_router(blog_router)
api_router.include_router(software_router)
api_router.include_router(services_router)
api_router.include_router(projects_router)
api_router.include_router(training_router)
api_router.include_router(cms_router)
api_router.include_router(public_router)
api_router.include_router(careers_router)
api_router.include_router(support_router)

"""Authentication service with JWT, registration, login, and password management."""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token, create_refresh_token,
    get_password_hash, verify_password, verify_token,
)
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import UserRegister, TokenResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserRegister) -> User:
        result = await self.db.execute(select(User).where(User.email == data.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise ValueError("Email already registered")

        user = User(
            email=data.email,
            hashed_password=get_password_hash(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            role="customer",
            is_active=True,
            is_verified=False,
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def login(self, email: str, password: str, is_admin: bool = False) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("Account is deactivated")

        if is_admin and user.role not in ("admin", "superadmin", "staff"):
            raise ValueError("Access denied. Admin privileges required.")
        elif not is_admin and user.role not in ("customer",):
            # If an admin tries to login as a customer, we could allow them, but the prompt says isolated.
            raise ValueError("Admins must login via admin portal")

        user.last_login = datetime.now(timezone.utc)
        await self.db.flush()

        audience = "admin" if is_admin else "customer"
        access_token = create_access_token(
            subject=str(user.id),
            extra_claims={"role": user.role, "email": user.email},
            audience=audience,
        )
        refresh_token = create_refresh_token(subject=str(user.id), audience=audience)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh_token(self, refresh_token: str, is_admin: bool = False) -> TokenResponse:
        audience = "admin" if is_admin else "customer"
        payload = verify_token(refresh_token, audience=audience)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")

        user_id = payload.get("sub")
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise ValueError("User not found or inactive")

        new_access = create_access_token(
            subject=str(user.id),
            extra_claims={"role": user.role, "email": user.email},
            audience=audience,
        )
        new_refresh = create_refresh_token(subject=str(user.id), audience=audience)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def change_password(self, user: User, current_password: str, new_password: str) -> bool:
        if not verify_password(current_password, user.hashed_password):
            raise ValueError("Current password is incorrect")

        user.hashed_password = get_password_hash(new_password)
        await self.db.flush()
        return True

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

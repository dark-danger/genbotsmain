"""Authentication API endpoints."""
import uuid
from fastapi import APIRouter, HTTPException, status
from loguru import logger
import asyncio
from collections import defaultdict
from sqlalchemy.exc import IntegrityError

from app.core.deps import DbSession, CurrentUser
from app.core.security import get_password_hash, create_access_token
from app.schemas.auth import (
    UserRegister, UserLogin, TokenResponse,
    RefreshTokenRequest, UserResponse, UserUpdate,
    ChangePasswordRequest,
)
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

_failed_attempts = defaultdict(int)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: DbSession):
    """Register a new user account."""
    service = AuthService(db)
    try:
        user = await service.register(data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except IntegrityError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: DbSession):
    """Authenticate user and return JWT tokens."""
    service = AuthService(db)
    try:
        token_response = await service.login(data.email, data.password)
        _failed_attempts[data.email] = 0
        return token_response
    except ValueError as e:
        _failed_attempts[data.email] += 1
        delay = min(5, _failed_attempts[data.email])
        await asyncio.sleep(delay)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: DbSession):
    """Refresh access token using refresh token."""
    service = AuthService(db)
    try:
        return await service.refresh_token(data.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser):
    """Get current authenticated user profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(data: UserUpdate, current_user: CurrentUser, db: DbSession):
    """Update current user profile."""
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    await db.flush()
    return current_user


@router.post("/change-password", response_model=MessageResponse)
async def change_password(data: ChangePasswordRequest, current_user: CurrentUser, db: DbSession):
    """Change password for authenticated user."""
    service = AuthService(db)
    try:
        await service.change_password(current_user, data.current_password, data.new_password)
        return MessageResponse(message="Password changed successfully")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ── Admin Login ────────────────────────────────────────────

@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(data: UserLogin, db: DbSession):
    """Admin-only login. Rejects non-admin users."""
    service = AuthService(db)
    try:
        token_response = await service.login(data.email, data.password)
    except ValueError as e:
        _failed_attempts[data.email] += 1
        delay = min(5, _failed_attempts[data.email])
        await asyncio.sleep(delay)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    # Reset counter on successful login
    _failed_attempts[data.email] = 0

    # Verify the user is admin/superadmin
    from app.core.security import verify_token
    from sqlalchemy import select
    from app.models.user import User
    payload = verify_token(token_response.access_token)
    if payload and payload.get("role") not in ("admin", "superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    return token_response


# ── Password Reset ────────────────────────────────────────

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# In-memory store for reset tokens (use Redis in production)
_reset_tokens: dict[str, str] = {}


@router.post("/password-reset-request", response_model=MessageResponse)
async def password_reset_request(data: PasswordResetRequest, db: DbSession):
    """Request a password reset link. Logs the token since SMTP is not configured."""
    from sqlalchemy import select
    from app.models.user import User
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if user:
        token = uuid.uuid4().hex
        _reset_tokens[token] = str(user.id)
        logger.info(f"Password reset token for {data.email}: {token}")
        # In production: send email with reset link containing this token
    # Always return success to prevent email enumeration
    return MessageResponse(message="If an account with that email exists, a reset link has been sent.")


@router.post("/password-reset", response_model=MessageResponse)
async def password_reset_confirm(data: PasswordResetConfirm, db: DbSession):
    """Reset password using a token."""
    from sqlalchemy import select
    from app.models.user import User
    user_id = _reset_tokens.pop(data.token, None)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(data.new_password)
    await db.flush()
    return MessageResponse(message="Password has been reset successfully.")

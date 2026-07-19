import asyncio
import os
import sys
from sqlalchemy import select

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.database import async_session_factory
from app.models.user import User
from app.core.security import get_password_hash

async def create_admin():
    print("Checking for admin user...")
    async with async_session_factory() as session:
        # Check if admin@genbots.in exists
        result = await session.execute(select(User).where(User.email == "admin@genbots.in"))
        admin = result.scalar_one_or_none()
        
        if admin:
            print(f"Admin user already exists: {admin.email} (Role: {admin.role})")
        else:
            print("Admin user does not exist. Creating...")
            admin = User(
                email="admin@genbots.in",
                hashed_password=get_password_hash("Admin@123"),
                first_name="Super",
                last_name="Admin",
                role="superadmin",
                is_active=True,
                is_verified=True,
            )
            session.add(admin)
            await session.commit()
            print("Admin user created successfully.")

if __name__ == "__main__":
    asyncio.run(create_admin())

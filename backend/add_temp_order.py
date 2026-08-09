import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import async_session_factory, engine, Base
from app.core.security import get_password_hash
from app.models import User, Product, Order, OrderItem

async def add_order():
    async with async_session_factory() as db:
        # Find or create user
        result = await db.execute(select(User).where(User.email == "khannayash399@gmail.com"))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                id=uuid.uuid4(), email="khannayash399@gmail.com",
                hashed_password=get_password_hash("Yash@123"),
                first_name="Yash", last_name="Khanna",
                role="superadmin", is_active=True, is_verified=True,
                email_verified_at=datetime.now(timezone.utc),
            )
            db.add(user)
            await db.flush()
        else:
            if user.role != "superadmin":
                user.role = "superadmin"
                await db.flush()
                
        # Get a product
        result = await db.execute(select(Product).limit(1))
        product = result.scalar_one_or_none()
        
        if not product:
            print("No products found to add an order.")
            return

        # Create Order
        order_number = f"GB-TMP-{uuid.uuid4().hex[:8].upper()}"
        order = Order(
            id=uuid.uuid4(),
            user_id=user.id,
            order_number=order_number,
            status="delivered",
            payment_status="paid",
            payment_method="cod",
            subtotal=product.price,
            tax_amount=product.price * 0.18,
            shipping_amount=0,
            discount_amount=0,
            total_amount=product.price * 1.18,
            shipping_name=f"{user.first_name} {user.last_name}",
            shipping_email=user.email,
            shipping_phone="9999999999",
            shipping_address_line1="Test Address 1",
            shipping_city="Test City",
            shipping_state="Test State",
            shipping_postal_code="110001",
            shipping_country="India"
        )
        db.add(order)
        await db.flush()
        
        # Create OrderItem
        order_item = OrderItem(
            id=uuid.uuid4(),
            order_id=order.id,
            product_id=product.id,
            product_name=product.name,
            product_sku=product.sku,
            product_image=product.images[0].url if product.images else None,
            quantity=1,
            unit_price=product.price,
            total_price=product.price
        )
        db.add(order_item)
        await db.commit()
        print(f"Successfully added order {order_number} to {user.email}")
        
if __name__ == "__main__":
    asyncio.run(add_order())

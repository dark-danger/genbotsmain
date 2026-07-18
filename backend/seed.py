"""Database seed script - populates initial data for all tables."""
import asyncio
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory, engine, Base
from app.core.security import get_password_hash
from app.models import *


async def seed_database():
    """Seed the database with initial data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        # Check if already seeded
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        # ── Users ────────────────────────────────────────────
        admin = User(
            id=uuid.uuid4(), email="admin@genbots.in",
            hashed_password=get_password_hash("Admin@123"),
            first_name="Admin", last_name="GenBots",
            role="superadmin", is_active=True, is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
        )
        customer = User(
            id=uuid.uuid4(), email="customer@genbots.in",
            hashed_password=get_password_hash("Customer@123"),
            first_name="Test", last_name="Customer",
            role="customer", is_active=True, is_verified=True,
            email_verified_at=datetime.now(timezone.utc),
        )
        db.add_all([admin, customer])
        await db.flush()

        # ── Categories ───────────────────────────────────────
        categories_data = [
            {"name": "IoT Sensors", "slug": "iot-sensors", "icon": "Cpu", "description": "High-quality IoT sensors for industrial and educational use"},
            {"name": "Arduino Products", "slug": "arduino-products", "icon": "Microchip", "description": "Official Arduino boards and compatible modules"},
            {"name": "ESP32 Products", "slug": "esp32-products", "icon": "Wifi", "description": "ESP32 development boards and modules"},
            {"name": "Robotics Kits", "slug": "robotics-kits", "icon": "Bot", "description": "Complete robotics kits for learning and projects"},
            {"name": "STEM Kits", "slug": "stem-kits", "icon": "FlaskConical", "description": "Science, Technology, Engineering & Math kits"},
            {"name": "AI Learning Kits", "slug": "ai-learning-kits", "icon": "Brain", "description": "AI and Machine Learning starter kits"},
            {"name": "Electronics Components", "slug": "electronics-components", "icon": "CircuitBoard", "description": "Resistors, capacitors, LEDs, and more"},
            {"name": "Home Automation", "slug": "home-automation", "icon": "Home", "description": "Smart home products and controllers"},
        ]
        cats = []
        for cd in categories_data:
            c = Category(**cd, is_active=True)
            db.add(c)
            cats.append(c)
        await db.flush()

        # ── Brands ───────────────────────────────────────────
        brands_data = [
            {"name": "GenBots", "slug": "genbots", "description": "GenBots proprietary products"},
            {"name": "Arduino", "slug": "arduino", "website": "https://arduino.cc"},
            {"name": "Espressif", "slug": "espressif", "website": "https://espressif.com"},
            {"name": "Raspberry Pi", "slug": "raspberry-pi", "website": "https://raspberrypi.org"},
            {"name": "Adafruit", "slug": "adafruit", "website": "https://adafruit.com"},
        ]
        brands = []
        for bd in brands_data:
            b = Brand(**bd, is_active=True)
            db.add(b)
            brands.append(b)
        await db.flush()

        # ── Products ─────────────────────────────────────────
        products_data = [
            {"name": "GenBots IoT Starter Kit", "slug": "genbots-iot-starter-kit", "sku": "GB-IOT-001", "price": 2499.00, "compare_at_price": 3499.00, "stock_quantity": 150, "category_id": cats[0].id, "brand_id": brands[0].id, "status": "active", "is_featured": True, "short_description": "Complete IoT learning kit with 20+ sensors, ESP32, and project guide", "description": "The GenBots IoT Starter Kit is a comprehensive package designed for students, hobbyists, and professionals. Includes ESP32 board, 20+ sensors, breadboard, jumper wires, and a detailed project guide with 15 hands-on projects."},
            {"name": "Arduino Uno R4 WiFi", "slug": "arduino-uno-r4-wifi", "sku": "ARD-UNO-R4W", "price": 1899.00, "compare_at_price": 2199.00, "stock_quantity": 200, "category_id": cats[1].id, "brand_id": brands[1].id, "status": "active", "is_featured": True, "short_description": "Official Arduino Uno R4 with built-in WiFi and BLE"},
            {"name": "ESP32-S3 DevKit", "slug": "esp32-s3-devkit", "sku": "ESP-S3-DK", "price": 799.00, "stock_quantity": 300, "category_id": cats[2].id, "brand_id": brands[2].id, "status": "active", "is_featured": True, "short_description": "ESP32-S3 development board with AI acceleration"},
            {"name": "GenBots Robotics Pro Kit", "slug": "genbots-robotics-pro-kit", "sku": "GB-ROB-PRO", "price": 4999.00, "compare_at_price": 6999.00, "stock_quantity": 75, "category_id": cats[3].id, "brand_id": brands[0].id, "status": "active", "is_featured": True, "short_description": "Advanced robotics kit with 6-DOF arm, chassis, and AI vision module"},
            {"name": "STEM Explorer Kit", "slug": "stem-explorer-kit", "sku": "GB-STEM-EXP", "price": 1999.00, "stock_quantity": 120, "category_id": cats[4].id, "brand_id": brands[0].id, "status": "active", "is_featured": True, "short_description": "40+ STEM experiments for schools and learning centers"},
            {"name": "AI Vision Module", "slug": "ai-vision-module", "sku": "GB-AI-VIS", "price": 3499.00, "stock_quantity": 50, "category_id": cats[5].id, "brand_id": brands[0].id, "status": "active", "is_featured": True, "short_description": "Camera module with onboard AI for object detection and recognition"},
            {"name": "Smart Home Hub", "slug": "smart-home-hub", "sku": "GB-SH-HUB", "price": 5999.00, "compare_at_price": 7499.00, "stock_quantity": 40, "category_id": cats[7].id, "brand_id": brands[0].id, "status": "active", "is_featured": True, "short_description": "Central hub for GenBots home automation ecosystem"},
            {"name": "Sensor Mega Pack (50 pcs)", "slug": "sensor-mega-pack", "sku": "GB-SEN-50", "price": 3999.00, "stock_quantity": 90, "category_id": cats[6].id, "brand_id": brands[0].id, "status": "active", "is_featured": True, "short_description": "Collection of 50 different sensors for Arduino and ESP32"},
        ]
        for pd in products_data:
            p = Product(**pd, tax_rate=18.00)
            db.add(p)
        await db.flush()

        # ── Software ─────────────────────────────────────────
        software_data = [
            {"name": "GenBots Home Automation", "slug": "genbots-home-automation", "category": "Home Automation", "short_description": "Control your smart home devices from anywhere", "description": "GenBots Home Automation app provides seamless control over all GenBots smart devices. Features include scheduling, automation rules, voice control support, and energy monitoring.", "features": ["Device Control", "Scheduling", "Voice Assistant", "Energy Monitor", "Multi-room", "Cloud Sync"], "system_requirements": {"os": "Windows 10+, macOS 12+, Linux", "ram": "4GB", "storage": "200MB"}, "is_free": True},
            {"name": "GenIDE", "slug": "genide", "category": "Development", "short_description": "IoT-focused integrated development environment", "description": "GenIDE is a powerful IDE designed specifically for IoT development. Supports Arduino, ESP32, and Raspberry Pi programming with built-in serial monitor, OTA update, and board manager.", "features": ["Code Editor", "Serial Monitor", "Board Manager", "OTA Updates", "Library Manager", "Simulator"], "system_requirements": {"os": "Windows 10+, macOS 12+, Linux", "ram": "8GB", "storage": "500MB"}, "is_free": True},
            {"name": "IoT Control App", "slug": "iot-control-app", "category": "IoT", "short_description": "Universal IoT device controller", "description": "Control any IoT device with this universal control app. Supports MQTT, HTTP, WebSocket protocols with customizable dashboard widgets.", "features": ["MQTT Support", "Custom Dashboards", "Data Logging", "Alerts", "API Integration"], "is_free": True},
            {"name": "GenBots Firmware Tools", "slug": "genbots-firmware-tools", "category": "Utilities", "short_description": "Firmware flashing and management utility", "description": "Flash, update, and manage firmware on GenBots devices. Supports batch operations and version management.", "features": ["Flash Firmware", "Batch Operations", "Version Management", "Backup/Restore"], "is_free": True},
        ]
        for sd in software_data:
            sw = Software(**sd, is_active=True)
            db.add(sw)
        await db.flush()

        # ── Services ─────────────────────────────────────────
        services_data = [
            {"name": "School Lab Setup", "slug": "school-lab-setup", "icon": "School", "short_description": "Complete robotics and IoT lab setup for schools", "features": ["Lab Design", "Equipment", "Training", "Curriculum", "Support"]},
            {"name": "University Lab Setup", "slug": "university-lab-setup", "icon": "GraduationCap", "short_description": "Innovation lab setup for universities", "features": ["Research Equipment", "AI/ML Lab", "IoT Lab", "Robotics Lab"]},
            {"name": "IoT Development", "slug": "iot-development", "icon": "Cpu", "short_description": "Custom IoT product development", "features": ["Hardware Design", "Firmware", "Cloud Platform", "Mobile App"]},
            {"name": "PCB Designing", "slug": "pcb-designing", "icon": "CircuitBoard", "short_description": "Professional PCB design and manufacturing", "features": ["Schematic Design", "PCB Layout", "Prototyping", "Mass Production"]},
            {"name": "AI Projects", "slug": "ai-projects", "icon": "Brain", "short_description": "AI and ML project development", "features": ["Computer Vision", "NLP", "Edge AI", "Model Training"]},
            {"name": "Industrial Automation", "slug": "industrial-automation", "icon": "Factory", "short_description": "Industry 4.0 automation solutions", "features": ["PLC Programming", "SCADA", "IoT Integration", "Monitoring"]},
        ]
        for svd in services_data:
            svc = Service(**svd, is_active=True)
            db.add(svc)
        await db.flush()

        # ── Projects ─────────────────────────────────────────
        projects_data = [
            {"title": "Smart Campus IoT System", "slug": "smart-campus-iot", "category": "IoT", "client": "ABC University", "short_description": "Complete IoT infrastructure for campus monitoring", "technologies": ["ESP32", "MQTT", "React", "PostgreSQL"], "status": "completed", "project_type": "client", "is_featured": True},
            {"title": "Automated Greenhouse", "slug": "automated-greenhouse", "category": "Agriculture", "client": "GreenFarms Ltd", "short_description": "AI-powered greenhouse automation system", "technologies": ["Raspberry Pi", "TensorFlow", "Python", "LoRa"], "status": "completed", "project_type": "client", "is_featured": True},
            {"title": "Industrial Safety Monitor", "slug": "industrial-safety-monitor", "category": "Industrial", "client": "SafeTech Industries", "short_description": "Real-time worker safety monitoring system", "technologies": ["Arduino", "Computer Vision", "Node.js"], "status": "running", "project_type": "client"},
        ]
        for prd in projects_data:
            proj = Project(**prd, is_active=True)
            db.add(proj)

        # ── Training Courses ─────────────────────────────────
        courses_data = [
            {"title": "IoT Fundamentals Bootcamp", "slug": "iot-fundamentals-bootcamp", "category": "IoT", "course_type": "bootcamp", "level": "beginner", "duration": "4 weeks", "price": 4999.00, "short_description": "Complete IoT bootcamp from basics to project deployment", "instructor": "Dr. Rahul Sharma", "is_featured": True},
            {"title": "Advanced Robotics Workshop", "slug": "advanced-robotics-workshop", "category": "Robotics", "course_type": "workshop", "level": "advanced", "duration": "2 days", "price": 2999.00, "short_description": "Hands-on robotics workshop with ROS2", "instructor": "Prof. Anita Desai", "is_featured": True},
            {"title": "AI & Machine Learning Certification", "slug": "ai-ml-certification", "category": "AI", "course_type": "certification", "level": "intermediate", "duration": "8 weeks", "price": 9999.00, "short_description": "Industry-recognized AI/ML certification program", "instructor": "Dr. Vikram Singh"},
        ]
        for cd in courses_data:
            course = TrainingCourse(**cd, is_active=True)
            db.add(course)

        # ── Testimonials ─────────────────────────────────────
        testimonials_data = [
            {"name": "Dr. Priya Mehta", "designation": "Principal", "company": "Delhi Public School", "content": "GenBots transformed our school's robotics lab. The students are more engaged than ever. Their support team is exceptional.", "rating": 5},
            {"name": "Rajesh Kumar", "designation": "CTO", "company": "TechVentures Inc", "content": "We've been using GenBots IoT solutions for our industrial automation needs. Reliable, scalable, and great support.", "rating": 5},
            {"name": "Prof. Sneha Kapoor", "designation": "HOD Electronics", "company": "IIT Kanpur", "content": "The innovation lab setup by GenBots is world-class. It has significantly enhanced our research capabilities.", "rating": 5},
            {"name": "Amit Patel", "designation": "Founder", "company": "SmartHome Solutions", "content": "GenBots home automation products are innovative and affordable. Perfect for the Indian market.", "rating": 4},
        ]
        for td in testimonials_data:
            t = Testimonial(**td, is_active=True)
            db.add(t)

        # ── FAQs ─────────────────────────────────────────────
        faqs_data = [
            {"question": "What payment methods do you accept?", "answer": "We accept Razorpay, UPI, credit/debit cards, net banking, and cash on delivery.", "category": "Payments"},
            {"question": "Do you offer bulk/wholesale pricing?", "answer": "Yes! We offer special pricing for bulk orders. Contact our sales team for a custom quote.", "category": "Pricing"},
            {"question": "What is your return policy?", "answer": "We offer a 7-day return policy for unused products in original packaging. Defective products can be returned within 30 days.", "category": "Returns"},
            {"question": "Do you provide lab setup services?", "answer": "Yes, we provide complete lab setup services for schools and universities, including equipment, furniture, training, and curriculum.", "category": "Services"},
            {"question": "Are your products compatible with Arduino IDE?", "answer": "Most of our products are compatible with Arduino IDE. Check the product description for specific compatibility details.", "category": "Products"},
            {"question": "Do you ship internationally?", "answer": "Currently, we ship across India. International shipping is available for bulk orders. Contact us for details.", "category": "Shipping"},
        ]
        for fd in faqs_data:
            f = Faq(**fd, is_active=True)
            db.add(f)

        # ── Blog Posts ───────────────────────────────────────
        blog_cat = BlogCategory(name="IoT", slug="iot", description="Internet of Things articles")
        blog_cat2 = BlogCategory(name="Robotics", slug="robotics", description="Robotics articles")
        blog_cat3 = BlogCategory(name="Tutorials", slug="tutorials", description="Technical tutorials")
        db.add_all([blog_cat, blog_cat2, blog_cat3])
        await db.flush()

        posts_data = [
            {"title": "Getting Started with ESP32: A Complete Guide", "slug": "getting-started-esp32-guide", "excerpt": "Learn everything about ESP32 development", "content": "ESP32 is a powerful microcontroller with WiFi and Bluetooth capabilities. In this guide, we'll cover everything from setting up the development environment to deploying your first IoT project...", "category_id": blog_cat.id, "author_id": admin.id, "status": "published", "is_featured": True, "tags": ["ESP32", "IoT", "Tutorial"], "published_at": datetime.now(timezone.utc)},
            {"title": "Building a Smart Home with GenBots", "slug": "building-smart-home-genbots", "excerpt": "Transform your home into a smart home", "content": "Home automation is becoming increasingly accessible. In this article, we explore how GenBots products can help you build a comprehensive smart home system...", "category_id": blog_cat.id, "author_id": admin.id, "status": "published", "tags": ["Smart Home", "IoT", "Automation"], "published_at": datetime.now(timezone.utc)},
            {"title": "Top 10 Robotics Projects for Students", "slug": "top-10-robotics-projects-students", "excerpt": "Inspiring robotics project ideas", "content": "Looking for robotics project ideas? Here are our top 10 picks for students at different skill levels...", "category_id": blog_cat2.id, "author_id": admin.id, "status": "published", "tags": ["Robotics", "Projects", "Students"], "published_at": datetime.now(timezone.utc)},
        ]
        for post_data in posts_data:
            post = BlogPost(**post_data)
            db.add(post)

        # ── Partners & Clients ───────────────────────────────
        partners = [
            Partner(name="Arduino", website="https://arduino.cc", is_active=True),
            Partner(name="Espressif Systems", website="https://espressif.com", is_active=True),
            Partner(name="Raspberry Pi Foundation", website="https://raspberrypi.org", is_active=True),
            Partner(name="Texas Instruments", website="https://ti.com", is_active=True),
        ]
        db.add_all(partners)

        clients = [
            Client(name="Delhi Public School", is_active=True),
            Client(name="IIT Kanpur", is_active=True),
            Client(name="BITS Pilani", is_active=True),
            Client(name="TechVentures Inc", is_active=True),
            Client(name="SmartHome Solutions", is_active=True),
        ]
        db.add_all(clients)

        # ── Careers ──────────────────────────────────────────
        careers = [
            Career(title="IoT Engineer", slug="iot-engineer", department="Engineering", location="Bangalore, India", job_type="full_time", experience="2-4 years", description="Join our IoT engineering team to build cutting-edge connected devices.", requirements=["ESP32/Arduino experience", "C/C++", "MQTT/HTTP protocols", "PCB design basics"], benefits=["Health insurance", "Flexible hours", "Learning budget"]),
            Career(title="Full Stack Developer", slug="full-stack-developer", department="Software", location="Remote", job_type="full_time", experience="3-5 years", description="Build and maintain our web platform and internal tools.", requirements=["React/Next.js", "Python/FastAPI", "PostgreSQL", "Docker"], benefits=["Remote work", "Stock options", "Conference budget"]),
        ]
        db.add_all(careers)

        # ── CMS Pages ────────────────────────────────────────
        homepage = CmsPage(
            page_key="homepage", title="Home",
            content={
                "hero": {
                    "title": "Innovating the Future through IoT, Robotics & AI",
                    "subtitle": "Build. Learn. Innovate. — Premium IoT & Robotics products for makers, students, and enterprises.",
                    "cta_primary": {"text": "Explore Products", "link": "/store"},
                    "cta_secondary": {"text": "Our Services", "link": "/services"},
                },
                "stats": [
                    {"value": "500+", "label": "Products"},
                    {"value": "200+", "label": "Schools Served"},
                    {"value": "50+", "label": "Lab Setups"},
                    {"value": "10K+", "label": "Happy Customers"},
                ],
            }
        )
        about_page = CmsPage(
            page_key="about", title="About GenBots",
            content={
                "overview": "GenBots is a leading IoT, Robotics & AI solutions company dedicated to empowering the next generation of innovators.",
                "mission": "To democratize technology education and provide world-class IoT & robotics solutions accessible to everyone.",
                "vision": "To become India's most trusted brand for IoT, Robotics & AI products and educational solutions.",
                "values": ["Innovation", "Quality", "Education", "Sustainability", "Customer First"],
            }
        )
        db.add_all([homepage, about_page])

        # ── Site Settings ────────────────────────────────────
        settings = [
            SiteSetting(key="site_name", value="GenBots", group="general"),
            SiteSetting(key="tagline", value="Innovating the Future through IoT, Robotics & AI", group="general"),
            SiteSetting(key="email", value="contact@genbots.in", group="contact"),
            SiteSetting(key="phone", value="+91 98765 43210", group="contact"),
            SiteSetting(key="address", value="GenBots Technology Park, Bangalore, Karnataka 560001, India", group="contact"),
            SiteSetting(key="whatsapp", value="+91 98765 43210", group="contact"),
            SiteSetting(key="business_hours", value="Mon-Sat: 9:00 AM - 6:00 PM", group="contact"),
            SiteSetting(key="currency", value="INR", group="store"),
            SiteSetting(key="tax_rate", value="18", group="store"),
            SiteSetting(key="free_shipping_threshold", value="999", group="store"),
        ]
        db.add_all(settings)

        # ── Social Links ─────────────────────────────────────
        socials = [
            SocialLink(platform="twitter", url="https://twitter.com/genbots", icon="Twitter"),
            SocialLink(platform="github", url="https://github.com/genbots", icon="Github"),
            SocialLink(platform="linkedin", url="https://linkedin.com/company/genbots", icon="Linkedin"),
            SocialLink(platform="youtube", url="https://youtube.com/@genbots", icon="Youtube"),
            SocialLink(platform="instagram", url="https://instagram.com/genbots", icon="Instagram"),
        ]
        db.add_all(socials)

        await db.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    from sqlalchemy import select
    asyncio.run(seed_database())

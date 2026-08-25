"""Product API endpoints with full CRUD and search."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.core.deps import DbSession, AdminUser, OptionalUser
from app.models.product import (
    Product, ProductImage, ProductVariant, ProductSpecification,
    Category, Brand, Review,
)
from app.schemas.product import (
    ProductCreate, ProductResponse, ProductListResponse,
    CategoryCreate, CategoryResponse,
    BrandCreate, BrandResponse,
    ReviewCreate, ReviewResponse,
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.product_service import ProductService
from app.utils.audit import log_audit_action
from app.utils.cache import global_cache

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedResponse[ProductListResponse])
async def list_products(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    featured: bool = False,
    status: str = "active",
):
    """List products with filtering, search, and pagination."""
    cache_key = f"list_products:{page}:{page_size}:{category}:{brand}:{search}:{min_price}:{max_price}:{sort_by}:{sort_order}:{featured}:{status}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    service = ProductService(db)
    result = await service.list_products(
        page=page, page_size=page_size,
        category_slug=category, brand_slug=brand,
        search=search, min_price=min_price, max_price=max_price,
        sort_by=sort_by, sort_order=sort_order, featured_only=featured,
        status=status,
    )
    # Serialize items for caching to avoid DetachedInstanceError
    result["items"] = [ProductListResponse.model_validate(p).model_dump() for p in result["items"]]
    global_cache.set(cache_key, result, ttl=30.0)
    return result


@router.get("/featured", response_model=list[ProductListResponse])
async def get_featured_products(db: DbSession, limit: int = Query(8, ge=1, le=20)):
    """Get featured products for homepage."""
    cache_key = f"featured_products:{limit}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    service = ProductService(db)
    products = await service.get_featured_products(limit)
    serialized = [ProductListResponse.model_validate(p).model_dump() for p in products]
    global_cache.set(cache_key, serialized, ttl=60.0)
    return serialized


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: DbSession):
    """List all active product categories."""
    from sqlalchemy import select
    from app.models.product import Category
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.sort_order.asc(), Category.name.asc())
    )
    return result.scalars().all()


@router.get("/brands", response_model=list[BrandResponse])
async def list_brands(db: DbSession):
    """List all active brands."""
    from sqlalchemy import select
    from app.models.product import Brand
    result = await db.execute(
        select(Brand)
        .where(Brand.is_active == True)
        .order_by(Brand.name.asc())
    )
    return result.scalars().all()


SCHOOL_LAB_DATA = [
    # Page 1
    {"name": "Arduino UNO R3", "price": 200.0, "category_slug": "arduino-products", "image": "/products/arduino-uno-r3.jpg", "desc": "Original Atmega328P based microcontroller development board for robotics, IoT, and embedded STEM learning."},
    {"name": "ESP32 Development Board", "price": 170.0, "category_slug": "esp32-products", "image": "/products/esp32-development-board.jpg", "desc": "Dual-core 2.4GHz WiFi & Bluetooth development board with 30/38 GPIO pins for IoT smart projects."},
    {"name": "Push Button Switch Module", "price": 25.0, "category_slug": "electronics-components", "image": "/products/push-button-module.jpg", "desc": "Momentary tactile push button module with built-in pull-down resistor for breadboards and Arduino."},
    {"name": "LDR Light Sensor Module", "price": 25.0, "category_slug": "iot-sensors", "image": "/products/ldr-light-sensor.jpg", "desc": "Light Dependent Resistor sensor module with digital and analog output for automatic lighting control."},
    {"name": "SW-520D Tilt Sensor Module", "price": 50.0, "category_slug": "iot-sensors", "image": "/products/tilt-sensor-module.jpg", "desc": "Ball tilt angle and orientation detection switch sensor module for motion triggered systems."},
    {"name": "Sound Detection Sensor Module", "price": 40.0, "category_slug": "iot-sensors", "image": "/products/sound-detection-sensor.jpg", "desc": "High sensitivity acoustic microphone sound sensor module with adjustable potentiometer comparator."},
    {"name": "10K Potentiometer Rotary Knob", "price": 45.0, "category_slug": "electronics-components", "image": "/products/potentiometer-10k.jpg", "desc": "Standard 10K ohm linear rotary potentiometer variable resistor with knob for analog input tuning."},
    {"name": "IR Obstacle Avoidance Sensor", "price": 25.0, "category_slug": "iot-sensors", "image": "/products/ir-obstacle-sensor.jpg", "desc": "Infrared distance detection obstacle avoidance sensor module for autonomous line and obstacle robots."},
    {"name": "LM35 Precision Temperature Sensor", "price": 40.0, "category_slug": "iot-sensors", "image": "/products/lm35-temperature-sensor.jpg", "desc": "Calibrated analog temperature sensor IC (10mV/°C) with -55°C to 150°C measurement range."},
    {"name": "Magnetic Reed Switch Sensor Module", "price": 50.0, "category_slug": "iot-sensors", "image": "/products/reed-switch-sensor.jpg", "desc": "Magnetic door/window proximity sensor switch module with digital output for security systems."},
    {"name": "HC-SR04 Ultrasonic Distance Sensor", "price": 65.0, "category_slug": "iot-sensors", "image": "/products/hc-sr04-ultrasonic.jpg", "desc": "2cm to 400cm non-contact distance measuring sonar module for robot navigation and level monitoring."},
    {"name": "DHT11 Temperature & Humidity Sensor", "price": 60.0, "category_slug": "iot-sensors", "image": "/products/dht11-sensor.jpg", "desc": "Digital temperature and relative humidity sensor with single-wire digital interface."},
    {"name": "Flame Detection Sensor Module", "price": 25.0, "category_slug": "iot-sensors", "image": "/products/flame-detection-sensor.jpg", "desc": "Infrared flame wavelength 760nm-1100nm fire detector sensor module for fire fighting robots."},
    {"name": "Water Level Depth Detection Sensor", "price": 20.0, "category_slug": "iot-sensors", "image": "/products/water-level-sensor.jpg", "desc": "Parallel copper traces analog water droplet and liquid depth detection sensor module."},
    {"name": "TTP223 Capacitive Touch Sensor", "price": 10.0, "category_slug": "iot-sensors", "image": "/products/touch-sensor-ttp223.jpg", "desc": "Single-channel capacitive touch key switch module with low power consumption."},
    {"name": "I-Blink Programmable Flash Module", "price": 130.0, "category_slug": "electronics-components", "image": "/products/i-blink-module.jpg", "desc": "Smart programmable multi-pattern LED flasher and pulse driver module for visual robotics indicators."},
    {"name": "5V Single Channel Relay Module", "price": 30.0, "category_slug": "home-automation", "image": "/products/relay-module-5v.jpg", "desc": "5V optocoupler isolated relay module (10A 250VAC) for Arduino and home automation switching."},
    {"name": "SG90 9g Micro Servo Motor", "price": 65.0, "category_slug": "robotics-kits", "image": "/products/sg90-servo-motor.jpg", "desc": "180-degree rotational 9g micro servo motor with horn accessories for robotic arms and RC planes."},
    {"name": "HC-SR501 PIR Motion Sensor", "price": 60.0, "category_slug": "home-automation", "image": "/products/pir-motion-sensor.jpg", "desc": "Pyroelectric infrared human body motion detection sensor module with adjustable delay and sensitivity."},
    {"name": "Capacitive Soil Moisture Sensor", "price": 40.0, "category_slug": "iot-sensors", "image": "/products/soil-moisture-sensor.jpg", "desc": "Corrosion-resistant analog capacitive soil moisture detection sensor for smart agriculture projects."},
    {"name": "Raindrops Detection Sensor Module", "price": 45.0, "category_slug": "iot-sensors", "image": "/products/rain-sensor-module.jpg", "desc": "Rain sensor board with separate control comparator module for automatic weather stations."},
    {"name": "MQ-2 Gas & Smoke Sensor Module", "price": 90.0, "category_slug": "iot-sensors", "image": "/products/mq2-gas-sensor.jpg", "desc": "Semiconductor sensor for LPG, smoke, alcohol, propane, methane, and hydrogen detection."},
    {"name": "HC-05 Bluetooth Serial Transceiver Module", "price": 165.0, "category_slug": "iot-sensors", "image": "/products/hc05-bluetooth-module.jpg", "desc": "Master/Slave Bluetooth 2.0+EDR serial communication module for wireless robot smartphone control."},

    # Page 2
    {"name": "A3144 Hall Effect Sensor Module", "price": 25.0, "category_slug": "iot-sensors", "image": "/products/hall-effect-sensor.jpg", "desc": "Magnetic field and RPM speed detection Hall effect sensor module with LM393 comparator."},
    {"name": "SW-420 Vibration Sensor Module", "price": 30.0, "category_slug": "iot-sensors", "image": "/products/vibration-sensor-sw420.jpg", "desc": "High sensitivity vibration and shock detection module for anti-theft alarms and smart vehicles."},
    {"name": "TCRT5000 IR Line Tracking Sensor", "price": 24.0, "category_slug": "robotics-kits", "image": "/products/ir-line-tracking-sensor.jpg", "desc": "Infrared reflective line tracking sensor module for black/white line follower robotic cars."},
    {"name": "RC522 13.56MHz RFID Reader Module Kit", "price": 75.0, "category_slug": "iot-sensors", "image": "/products/rfid-rc522-kit.jpg", "desc": "SPI RFID reader/writer module kit with RFID S50 card and key fob for access control systems."},
    {"name": "MQ-135 Air Quality Hazardous Gas Sensor", "price": 90.0, "category_slug": "iot-sensors", "image": "/products/mq135-air-quality-sensor.jpg", "desc": "Air quality monitoring sensor for NH3, NOx, alcohol, benzene, smoke, and CO2 detection."},
    {"name": "BH1750 Ambient Light Sensor (I2C)", "price": 95.0, "category_slug": "iot-sensors", "image": "/products/bh1750-light-sensor.jpg", "desc": "16-bit digital ambient light lux meter sensor module with I2C interface for high precision lighting."},
    {"name": "BMP180 Digital Barometric Pressure Sensor", "price": 38.0, "category_slug": "iot-sensors", "image": "/products/bmp180-pressure-sensor.jpg", "desc": "High precision atmospheric pressure and altitude sensor module with I2C interface."},
    {"name": "0.96 inch I2C OLED Display Module", "price": 130.0, "category_slug": "electronics-components", "image": "/products/oled-display-096.jpg", "desc": "128x64 self-luminous high-contrast OLED graphical display module with 4-pin I2C interface."},
    {"name": "RCWL-0516 Microwave Radar Motion Sensor", "price": 60.0, "category_slug": "iot-sensors", "image": "/products/rcwl0516-radar-sensor.jpg", "desc": "Doppler radar microwave motion detection sensor with 360-degree obstacle penetration."},
    {"name": "PAM8403 2x3W Mini Stereo Audio Amplifier", "price": 180.0, "category_slug": "electronics-components", "image": "/products/pam8403-amplifier.jpg", "desc": "Class-D high-efficiency mini digital stereo audio power amplifier board with volume potentiometer."},
    {"name": "Universal Copper Clad Dot Prototype PCB", "price": 20.0, "category_slug": "electronics-components", "image": "/products/dot-matrix-pcb.jpg", "desc": "Single-sided 5x7cm universal perfboard matrix PCB for DIY electronic circuit prototyping."},
    {"name": "Assorted Resistor Kit (30 Values / 100 Pcs)", "price": 20.0, "category_slug": "electronics-components", "image": "/products/resistor-kit-pack.jpg", "desc": "1/4W 1% metal film assorted resistor variety pack covering 10 ohm to 1M ohm values."},
    {"name": "MB-102 830 Tie-Point Solderless Breadboard", "price": 50.0, "category_slug": "electronics-components", "image": "/products/mb102-breadboard.jpg", "desc": "Standard full-size 830 tie-point solderless breadboard with dual power rails for circuit prototyping."},
    {"name": "USB A to Type-B Programming Cable", "price": 20.0, "category_slug": "electronics-components", "image": "/products/usb-programming-cable.jpg", "desc": "Durable shielded USB programming and data transmission cable for Arduino UNO and Mega boards."},
    {"name": "Dual 18650 Battery Holder with Wire Leads", "price": 20.0, "category_slug": "electronics-components", "image": "/products/battery-holder-18650.jpg", "desc": "7.4V series 2-slot 18650 cylindrical battery holder casing with color-coded wire leads."},
    {"name": "18650 3.7V Rechargeable Lithium Battery", "price": 60.0, "category_slug": "electronics-components", "image": "/products/rechargeable-18650-battery.jpg", "desc": "High capacity 3.7V cylindrical lithium-ion rechargeable battery cell for robotics power packs."},
    {"name": "Hot Melt Glue Gun (20W Trigger Feed)", "price": 250.0, "category_slug": "stem-kits", "image": "/products/hot-glue-gun.jpg", "desc": "Compact 20W PTC heating rapid hot melt adhesive glue gun with insulated nozzle and stand."},
    {"name": "60W Soldering Iron Kit with Stand & Solder", "price": 250.0, "category_slug": "stem-kits", "image": "/products/soldering-iron-kit.jpg", "desc": "Complete 60W temperature adjustable electric soldering iron set with stand, sponge, and solder wire."},
    {"name": "Precision Screwdriver Tool Kit for Electronics", "price": 250.0, "category_slug": "stem-kits", "image": "/products/precision-screwdriver-kit.jpg", "desc": "Multi-bit magnetic precision screwdriver set for robotics hardware, gadgets, and lab repairs."},
    {"name": "Multi-Function Wire Stripper & Cutter", "price": 200.0, "category_slug": "stem-kits", "image": "/products/wire-stripper-tool.jpg", "desc": "Heavy-duty wire stripper, crimper, and cable shears for clean electronics lab wire preparation."},
    {"name": "2.2 Inch Flexible Bend Sensor (Flex Sensor)", "price": 190.0, "category_slug": "iot-sensors", "image": "/products/flex-sensor-22.jpg", "desc": "Variable resistance bend flex sensor for robotic gaming gloves, biomechanics, and gesture controls."},
    {"name": "40-Pin Male to Male Jumper Wire Set (20cm)", "price": 40.0, "category_slug": "electronics-components", "image": "/products/jumper-wire-male-male.jpg", "desc": "High quality 40-conductor ribbon cable with male-to-male pin connectors for breadboard prototyping."},
    {"name": "40-Pin Male to Female Jumper Wire Set (20cm)", "price": 40.0, "category_slug": "electronics-components", "image": "/products/jumper-wire-male-to-female.jpg", "desc": "Flexible 40-pin male to female detachable ribbon jumper wires for connecting sensor modules."},
    {"name": "5mm Diffused RGB LED (Pack of 10)", "price": 2.0, "category_slug": "electronics-components", "image": "/products/rgb-led-5mm.jpg", "desc": "Common cathode 4-pin diffused tri-color Red Green Blue LED for vibrant lighting indicators."},
    {"name": "220 Ohm Carbon Film Resistors (Pack)", "price": 1.0, "category_slug": "electronics-components", "image": "/products/220-ohm-resistors.jpg", "desc": "1/4 Watt 5% 220R carbon film current limiting resistors ideal for LEDs and microcontrollers."},

    # Page 3
    {"name": "10K Ohm Carbon Film Resistors (Pack)", "price": 1.0, "category_slug": "electronics-components", "image": "/products/10k-ohm-resistors.jpg", "desc": "1/4 Watt 5% 10K ohm pull-up and pull-down carbon film resistors for digital input pins."},
    {"name": "Small ABS Plastic Project Enclosure Box", "price": 100.0, "category_slug": "electronics-components", "image": "/products/plastic-project-box.jpg", "desc": "Durable dustproof ABS plastic project case housing box with screws for circuits and sensors."},
    {"name": "Flame Retardant PVC Electrical Insulation Tape", "price": 20.0, "category_slug": "electronics-components", "image": "/products/insulation-tape.jpg", "desc": "High dielectric strength pressure-sensitive PVC insulating tape for electrical wire joints."},
    {"name": "Heavy Duty Nylon Cable Zip Ties (Pack of 100)", "price": 20.0, "category_slug": "electronics-components", "image": "/products/cable-zip-ties.jpg", "desc": "Self-locking UV resistant nylon cable wire ties for neat wire routing and robotic cable management."},
    {"name": "Hot Melt Glue Sticks (Pack of 10)", "price": 100.0, "category_slug": "stem-kits", "image": "/products/glue-sticks-pack.jpg", "desc": "7mm transparent high-viscosity hot glue gun sticks for rapid prototyping and chassis bonding."},
    {"name": "Universal 4-Socket Multi-Plug Extension Board", "price": 200.0, "category_slug": "stem-kits", "image": "/products/extension-board.jpg", "desc": "Heavy duty 4-way universal power strip with individual master switch and surge protector."},
    {"name": "6-Inch Carbon Steel Long Nose Plier", "price": 150.0, "category_slug": "stem-kits", "image": "/products/long-nose-plier.jpg", "desc": "Precision needle nose gripping plier with rubberized ergonomic handles for electronics assembly."},
    {"name": "DT-830D Digital Multimeter with Probes", "price": 180.0, "category_slug": "stem-kits", "image": "/products/digital-multimeter.jpg", "desc": "Digital LCD multimeter for measuring DC/AC voltage, current, resistance, diode, and continuity."},
    {"name": "Spider Robot DIY STEM Quadruped Walking Kit", "price": 1000.0, "category_slug": "robotics-kits", "image": "/products/spider-robot-kit.jpg", "desc": "Complete 8-DOF quadruped bio-mimetic walking spider robot kit with chassis, servos, and controller."},
    {"name": "OTTO BOT DIY Open-Source Biped Dancing Robot Kit", "price": 2000.0, "category_slug": "robotics-kits", "image": "/products/otto-bot-kit.jpg", "desc": "Interactive programmable biped obstacle avoiding and dancing robot kit with ultrasonic sensor & buzzer."},
    {"name": "4-DOF Acrylic Programmable Robotic Arm Kit", "price": 2400.0, "category_slug": "robotics-kits", "image": "/products/robotic-arm-kit.jpg", "desc": "Laser-cut acrylic 4-axis industrial robotic arm kit with MG90S metal gear servos and claw gripper."},
    {"name": "6-Wheel Drive Heavy Duty All-Terrain Robot Chassis Kit", "price": 1200.0, "category_slug": "robotics-kits", "image": "/products/6wheel-robot-kit.jpg", "desc": "All-terrain 6WD aluminum alloy robot chassis platform with 6 high-torque BO motors and wheels."},
    {"name": "Desktop 3D Printer for Schools & STEM Labs", "price": 17000.0, "category_slug": "stem-kits", "image": "/products/3d-printer-stem.jpg", "desc": "High precision FDM desktop 3D printer with heated bed and auto-leveling for school robotics lab fabrication."},
]


@router.post("/sync-school-lab", status_code=status.HTTP_200_OK)
@router.get("/sync-school-lab", status_code=status.HTTP_200_OK)
async def sync_school_lab_products(db: DbSession):
    """Seed and sync all official GenBots School Lab products into the catalog."""
    from slugify import slugify
    import uuid
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.product import Product, ProductImage, ProductSpecification, Category, Brand

    # 1. Fetch Categories
    cat_res = await db.execute(select(Category))
    categories = {c.slug: c.id for c in cat_res.scalars().all()}

    # 2. Fetch Brand
    brand_res = await db.execute(select(Brand).limit(1))
    brand = brand_res.scalar_one_or_none()
    brand_id = brand.id if brand else None

    synced_count = 0
    for p_data in SCHOOL_LAB_DATA:
        p_slug = slugify(p_data["name"])
        cat_id = categories.get(p_data["category_slug"])
        
        # Check if already exists by slug or name
        existing_res = await db.execute(select(Product).options(selectinload(Product.images)).where(Product.slug == p_slug))
        product = existing_res.scalar_one_or_none()

        if not product:
            existing_by_name = await db.execute(select(Product).options(selectinload(Product.images)).where(Product.name == p_data["name"]))
            product = existing_by_name.scalar_one_or_none()

        if product:
            # Update existing
            product.price = p_data["price"]
            product.description = p_data["desc"]
            product.short_description = p_data["desc"][:200]
            product.category_id = cat_id or product.category_id
            product.status = "active"
            product.stock_quantity = 100
            
            # Update or add primary image
            if not product.images:
                img = ProductImage(
                    product_id=product.id,
                    url=p_data["image"],
                    alt_text=p_data["name"],
                    is_primary=True,
                    sort_order=0
                )
                db.add(img)
            else:
                product.images[0].url = p_data["image"]
        else:
            # Create new
            product = Product(
                id=uuid.uuid4(),
                name=p_data["name"],
                slug=p_slug,
                sku=f"GEN-{slugify(p_data['name'])[:10].upper()}-{uuid.uuid4().hex[:4].upper()}",
                description=p_data["desc"],
                short_description=p_data["desc"][:200],
                category_id=cat_id,
                brand_id=brand_id,
                price=p_data["price"],
                compare_at_price=round(p_data["price"] * 1.25, 2),
                stock_quantity=100,
                status="active",
                is_featured=p_data["price"] >= 1000 or "Arduino" in p_data["name"] or "ESP32" in p_data["name"],
                tax_rate=18.00,
            )
            db.add(product)
            await db.flush()

            img = ProductImage(
                product_id=product.id,
                url=p_data["image"],
                alt_text=p_data["name"],
                is_primary=True,
                sort_order=0
            )
            db.add(img)

        synced_count += 1

    await db.flush()
    global_cache.clear()
    return {"message": f"Successfully created and synced all {synced_count} school lab products in the store!", "count": synced_count}


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(slug: str, db: DbSession):
    """Get product details by slug or ID."""
    cache_key = f"product:{slug}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    service = ProductService(db)
    product = await service.get_product_by_slug_or_id(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    serialized = ProductResponse.model_validate(product).model_dump()
    global_cache.set(cache_key, serialized, ttl=30.0)
    return serialized


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate, db: DbSession, admin: AdminUser):
    """Create a new product (admin only)."""
    if data.status == "published":
        data.status = "active"
    service = ProductService(db)
    product = await service.create_product(data)
    
    # Invalidate cache on modification
    global_cache.clear()
    
    await log_audit_action(
        db,
        user_id=admin.id,
        action="create_product",
        resource_type="product",
        resource_id=product.id,
        details={"name": product.name, "sku": product.sku}
    )
    return product


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: UUID, data: dict, db: DbSession, admin: AdminUser):
    """Update a product (admin only)."""
    if data.get("status") == "published":
        data["status"] = "active"
    service = ProductService(db)
    product = await service.update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Invalidate cache on modification
    global_cache.clear()
    
    await log_audit_action(
        db,
        user_id=admin.id,
        action="update_product",
        resource_type="product",
        resource_id=product.id,
        details={"updates": data}
    )
    return product


@router.delete("/{product_id}", response_model=MessageResponse)
async def delete_product(product_id: UUID, db: DbSession, admin: AdminUser):
    """Delete a product (admin only)."""
    service = ProductService(db)
    deleted = await service.delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Invalidate cache on modification
    global_cache.clear()
    
    await log_audit_action(
        db,
        user_id=admin.id,
        action="delete_product",
        resource_type="product",
        resource_id=product_id
    )
    return MessageResponse(message="Product deleted successfully")





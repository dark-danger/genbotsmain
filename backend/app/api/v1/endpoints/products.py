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


# All 65 items extracted from the official "Innovation Lab — Product List" PDF
SCHOOL_LAB_DATA = [
    # 1. Core Development Hardware
    {"sno": 1, "name": "Desktop 3D Printer", "category_slug": "stem-kits", "qty": 1, "cost_price": 18000.0, "desc": "Used for rapid prototyping of mechanical parts, enclosures and robot bodies via FDM printing.", "specs": "FDM technology, standard build volume, PLA/ABS filament compatible, USB/SD card input.", "image": "/products/3d-printer-stem.jpg", "sku_prefix": "GEN-DEV-1"},
    {"sno": 2, "name": "Arduino UNO", "category_slug": "arduino-products", "qty": 40, "cost_price": 200.0, "desc": "Beginner-friendly microcontroller board for learning embedded programming and basic circuits.", "specs": "ATmega328P MCU, 14 digital I/O pins, 6 analog inputs, 5V logic, USB programming.", "image": "/products/arduino-uno-r3.jpg", "sku_prefix": "GEN-ARD-1"},
    {"sno": 3, "name": "ESP32 Development Board", "category_slug": "esp32-products", "qty": 20, "cost_price": 170.0, "desc": "Wi-Fi/Bluetooth enabled microcontroller for IoT projects requiring wireless connectivity.", "specs": "Dual-core 240MHz, Wi-Fi + BLE, 30+ GPIO pins, USB-to-serial programming.", "image": "/products/esp32-development-board.jpg", "sku_prefix": "GEN-ESP-1"},
    {"sno": 4, "name": "ESP32-C3 Development Board", "category_slug": "esp32-products", "qty": 20, "cost_price": 250.0, "desc": "Compact, low-cost RISC-V based board for lightweight IoT applications.", "specs": "RISC-V single-core, Wi-Fi + BLE 5.0, USB-C, small form factor.", "image": "/products/esp32-development-board.jpg", "sku_prefix": "GEN-ESP-2"},

    # 2. Sensors & Modules
    {"sno": 5, "name": "Push Button", "category_slug": "electronics-components", "qty": 30, "cost_price": 20.0, "desc": "Simple momentary switch used for user input in circuits.", "specs": "4-pin tactile switch, 12x12mm, momentary contact.", "image": "/products/push-button-module.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 6, "name": "LDR (Light Sensor)", "category_slug": "iot-sensors", "qty": 30, "cost_price": 25.0, "desc": "Detects ambient light intensity for light-based automation projects.", "specs": "Photoresistor, resistance varies with light, 5mm package.", "image": "/products/ldr-light-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 7, "name": "Tilt Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 50.0, "desc": "Detects orientation/tilt for motion or angle-based triggers.", "specs": "Ball-in-tube mercury-free switch, digital output.", "image": "/products/tilt-sensor-module.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 8, "name": "Sound Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 40.0, "desc": "Detects sound intensity/claps for sound-activated projects.", "specs": "Electret microphone with LM393 comparator, digital + analog output.", "image": "/products/sound-detection-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 9, "name": "Potentiometer", "category_slug": "electronics-components", "qty": 30, "cost_price": 45.0, "desc": "Variable resistor used for manual analog input control (volume, speed, etc.).", "specs": "10K ohm rotary type, 3-pin, linear taper.", "image": "/products/potentiometer-10k.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 10, "name": "IR Obstacle Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 25.0, "desc": "Detects obstacles in front of robots using infrared reflection.", "specs": "IR LED + phototransistor pair, adjustable sensitivity, digital output.", "image": "/products/ir-obstacle-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 11, "name": "Temperature Sensor (LM35)", "category_slug": "iot-sensors", "qty": 30, "cost_price": 40.0, "desc": "Measures ambient temperature for monitoring/automation systems.", "specs": "Analog output, 10mV/°C, range -55°C to 150°C.", "image": "/products/lm35-temperature-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 12, "name": "Reed Switch Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 50.0, "desc": "Detects presence of a magnetic field, used in door/proximity sensing.", "specs": "Magnetically operated switch, normally open contact.", "image": "/products/reed-switch-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 13, "name": "Ultrasonic Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 65.0, "desc": "Measures distance using sound waves; widely used in robotics for obstacle detection.", "specs": "HC-SR04 type, 2cm-400cm range, trigger/echo pins.", "image": "/products/hc-sr04-ultrasonic.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 14, "name": "DHT11 Temperature & Humidity", "category_slug": "iot-sensors", "qty": 30, "cost_price": 60.0, "desc": "Measures both temperature and humidity for environmental monitoring.", "specs": "Digital output, 0-50°C, 20-90% RH range.", "image": "/products/dht11-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 15, "name": "Flame Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 25.0, "desc": "Detects presence of fire/flame for fire-safety related projects.", "specs": "IR flame detection, 760-1100nm wavelength, digital/analog output.", "image": "/products/flame-detection-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 16, "name": "Water Level Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 20.0, "desc": "Detects water level for tank monitoring and irrigation automation.", "specs": "Conductive trace strip, analog output.", "image": "/products/water-level-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 17, "name": "Touch Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 10.0, "desc": "Capacitive touch-based input switch for interactive projects.", "specs": "TTP223 module, digital output, touch-activated.", "image": "/products/touch-sensor-ttp223.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 18, "name": "I-Blink Module", "category_slug": "electronics-components", "qty": 30, "cost_price": 130.0, "desc": "Specialized indicator/blink module used in signaling circuits.", "specs": "LED blink driver module, standard voltage input.", "image": "/products/i-blink-module.jpg", "sku_prefix": "GEN-MOD-1"},
    {"sno": 19, "name": "Relay Module", "category_slug": "home-automation", "qty": 30, "cost_price": 30.0, "desc": "Allows microcontrollers to switch high-power AC/DC loads safely.", "specs": "5V single-channel relay, optocoupler isolated, 10A contact rating.", "image": "/products/relay-module-5v.jpg", "sku_prefix": "GEN-MOD-1"},
    {"sno": 20, "name": "Servo Motor", "category_slug": "robotics-kits", "qty": 30, "cost_price": 65.0, "desc": "Provides precise angular movement for robotic arms and mechanisms.", "specs": "SG90 micro servo, 180° rotation, PWM controlled.", "image": "/products/sg90-servo-motor.jpg", "sku_prefix": "GEN-MOT-1"},
    {"sno": 21, "name": "PIR Motion Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 60.0, "desc": "Detects human/animal movement using infrared radiation.", "specs": "HC-SR501 type, adjustable delay & sensitivity, 3-7m range.", "image": "/products/pir-motion-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 22, "name": "Soil Moisture Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 40.0, "desc": "Measures soil moisture content for smart agriculture/irrigation projects.", "specs": "Two-probe conductivity sensor, analog + digital output.", "image": "/products/soil-moisture-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 23, "name": "Rain Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 45.0, "desc": "Detects rainfall/water droplets for weather-based automation.", "specs": "Conductive PCB grid sensor, analog + digital output.", "image": "/products/rain-sensor-module.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 24, "name": "MQ2 Gas Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 90.0, "desc": "Detects LPG, smoke and combustible gases for safety systems.", "specs": "MQ-2 semiconductor sensor, analog output, preheat required.", "image": "/products/mq2-gas-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 25, "name": "Bluetooth Module (HC-05)", "category_slug": "iot-sensors", "qty": 30, "cost_price": 165.0, "desc": "Enables wireless serial communication between devices via Bluetooth.", "specs": "Bluetooth 2.0, master/slave mode, UART interface.", "image": "/products/hc05-bluetooth-module.jpg", "sku_prefix": "GEN-COM-1"},
    {"sno": 26, "name": "Hall Effect Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 25.0, "desc": "Detects magnetic field presence for speed/position sensing.", "specs": "Digital output, activates near magnetic field.", "image": "/products/hall-effect-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 27, "name": "Vibration Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 30.0, "desc": "Detects mechanical vibration/shock for security or monitoring projects.", "specs": "SW-420 module, digital output, adjustable sensitivity.", "image": "/products/vibration-sensor-sw420.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 28, "name": "IR Line Tracking Sensor", "category_slug": "robotics-kits", "qty": 30, "cost_price": 24.0, "desc": "Detects line contrast for line-following robots.", "specs": "IR reflective sensor, digital output, adjustable threshold.", "image": "/products/ir-line-tracking-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 29, "name": "RFID Module", "category_slug": "iot-sensors", "qty": 30, "cost_price": 75.0, "desc": "Enables contactless identification/access systems using RFID tags.", "specs": "RC522 13.56MHz reader/writer, SPI interface, includes tag & card.", "image": "/products/rfid-rc522-kit.jpg", "sku_prefix": "GEN-COM-1"},
    {"sno": 30, "name": "MQ135 Air Quality Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 90.0, "desc": "Detects air quality by sensing gases like ammonia, CO2, and smoke.", "specs": "MQ-135 semiconductor sensor, analog output.", "image": "/products/mq135-air-quality-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 31, "name": "BH1750 Light Intensity Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 95.0, "desc": "Provides precise digital ambient light intensity measurement in lux.", "specs": "I2C digital output, 1-65535 lux range.", "image": "/products/bh1750-light-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 32, "name": "BMP180 Barometric Pressure Sensor", "category_slug": "iot-sensors", "qty": 30, "cost_price": 38.0, "desc": "Measures atmospheric pressure and altitude for weather stations.", "specs": "I2C interface, 300-1100hPa range, includes temperature reading.", "image": "/products/bmp180-pressure-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 33, "name": "OLED Display Module", "category_slug": "electronics-components", "qty": 30, "cost_price": 130.0, "desc": "Compact display for showing sensor data/text in embedded projects.", "specs": "0.96\" I2C OLED, 128x64 resolution, monochrome.", "image": "/products/oled-display-096.jpg", "sku_prefix": "GEN-DIS-1"},
    {"sno": 34, "name": "Motion Sensor (RCWL-0516)", "category_slug": "iot-sensors", "qty": 30, "cost_price": 60.0, "desc": "General-purpose microwave doppler motion detection module for automation projects.", "specs": "Digital output motion detector, adjustable sensitivity.", "image": "/products/rcwl0516-radar-sensor.jpg", "sku_prefix": "GEN-SEN-1"},
    {"sno": 35, "name": "Amplifier Module", "category_slug": "electronics-components", "qty": 30, "cost_price": 180.0, "desc": "Amplifies audio signals for speaker output in sound-based projects.", "specs": "Class-D audio amplifier module, standard voltage input.", "image": "/products/pam8403-amplifier.jpg", "sku_prefix": "GEN-MOD-1"},

    # 3. Electronics Components & Accessories
    {"sno": 36, "name": "LED Assortment Kits", "category_slug": "electronics-components", "qty": 30, "cost_price": 2.0, "desc": "Basic indicator LEDs for circuit prototyping and signaling.", "specs": "Assorted colors (Red/Green/Blue/Yellow), 5mm, standard forward voltage.", "image": "/products/rgb-led-5mm.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 37, "name": "PCB (0 PCB)", "category_slug": "electronics-components", "qty": 100, "cost_price": 250.0, "desc": "Perforated prototyping board for soldering and permanent circuit builds.", "specs": "General-purpose zero PCB, standard hole spacing.", "image": "/products/dot-matrix-pcb.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 38, "name": "Resistor Kits", "category_slug": "electronics-components", "qty": 30, "cost_price": 250.0, "desc": "Assorted resistors used for current-limiting and voltage division in circuits.", "specs": "Assorted values (typically 1Ω-1MΩ), 1/4W carbon film.", "image": "/products/resistor-kit-pack.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 39, "name": "Breadboards", "category_slug": "electronics-components", "qty": 30, "cost_price": 250.0, "desc": "Solderless prototyping boards for temporary circuit assembly.", "specs": "830-point standard size breadboard.", "image": "/products/mb102-breadboard.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 40, "name": "Jumper Wire Sets", "category_slug": "electronics-components", "qty": 30, "cost_price": 40.0, "desc": "Connecting wires for breadboard and module interconnections.", "specs": "Male-Male/Male-Female/Female-Female assorted sets.", "image": "/products/jumper-wire-male-male.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 41, "name": "Switches", "category_slug": "electronics-components", "qty": 30, "cost_price": 2.0, "desc": "General-purpose on/off switches for power control in circuits.", "specs": "SPST toggle/slide switch, standard rating.", "image": "/products/push-button-module.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 42, "name": "Battery Holders", "category_slug": "electronics-components", "qty": 50, "cost_price": 20.0, "desc": "Holds batteries securely and provides connection points for power supply.", "specs": "AA/9V compatible holder with lead wires.", "image": "/products/battery-holder-18650.jpg", "sku_prefix": "GEN-PWR-1"},
    {"sno": 43, "name": "Rechargeable Batteries", "category_slug": "electronics-components", "qty": 50, "cost_price": 60.0, "desc": "Reusable power source for portable projects and robots.", "specs": "NiMH/Li-ion rechargeable cells, standard capacity.", "image": "/products/rechargeable-18650-battery.jpg", "sku_prefix": "GEN-PWR-1"},
    {"sno": 44, "name": "Battery Chargers", "category_slug": "electronics-components", "qty": 20, "cost_price": 60.0, "desc": "Used to recharge rechargeable batteries used in lab projects.", "specs": "Multi-slot charger compatible with AA/Li-ion cells.", "image": "/products/lipo-battery-b3-charger.jpg", "sku_prefix": "GEN-PWR-1"},
    {"sno": 45, "name": "USB Programming Cables", "category_slug": "electronics-components", "qty": 10, "cost_price": 20.0, "desc": "Used to connect and program microcontroller boards via USB.", "specs": "USB-A to Micro-USB/Type-C, standard data cable.", "image": "/products/usb-programming-cable.jpg", "sku_prefix": "GEN-PRT-1"},
    {"sno": 46, "name": "Power Supply Modules", "category_slug": "electronics-components", "qty": 30, "cost_price": 250.0, "desc": "Regulates voltage for powering breadboard circuits.", "specs": "Breadboard power supply module, 3.3V/5V dual output.", "image": "/products/extension-board.jpg", "sku_prefix": "GEN-PWR-1"},

    # 4. Fabrication & Assembly Tools
    {"sno": 47, "name": "Heat Gun", "category_slug": "stem-kits", "qty": 2, "cost_price": 250.0, "desc": "Used for heat-shrink tubing and desoldering applications.", "specs": "Dual temperature settings, standard household voltage.", "image": "/products/hot-glue-gun.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 48, "name": "Glue Gun", "category_slug": "stem-kits", "qty": 5, "cost_price": 250.0, "desc": "Used for quick mechanical bonding in prototyping and enclosures.", "specs": "Hot melt glue gun, standard glue stick size.", "image": "/products/hot-glue-gun.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 49, "name": "Soldering Iron Kit", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Essential tool for soldering electronic components onto PCBs.", "specs": "30-60W adjustable iron with stand, solder wire & accessories.", "image": "/products/soldering-iron-kit.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 50, "name": "Screwdriver Kit", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Used for assembling/disassembling mechanical and electronic enclosures.", "specs": "Precision multi-bit screwdriver set.", "image": "/products/precision-screwdriver-kit.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 51, "name": "Wire Stripper", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Used to strip insulation from wires for connections.", "specs": "Adjustable multi-gauge wire stripper/cutter.", "image": "/products/automatic-wire-stripper.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 52, "name": "Cutting Plier", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Used for cutting wires and component leads.", "specs": "Standard diagonal cutting plier.", "image": "/products/long-nose-plier.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 53, "name": "Long Nose Plier", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Used for gripping and bending wires in tight spaces.", "specs": "Standard long-nose (needle-nose) plier.", "image": "/products/long-nose-plier.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 54, "name": "Digital Multimeter", "category_slug": "stem-kits", "qty": 5, "cost_price": 250.0, "desc": "Used to measure voltage, current, resistance and continuity in circuits.", "specs": "Digital display, DC/AC voltage, current & resistance measurement.", "image": "/products/dt830d-digital-multimeter.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 55, "name": "Helping Hand Tool", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Holds PCBs/components steady during soldering work.", "specs": "Adjustable arms with alligator clips and magnifier.", "image": "/products/soldering-iron-kit.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 56, "name": "Electrical Tape", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Used for insulating wire connections and joints.", "specs": "PVC insulation tape, standard roll.", "image": "/products/insulation-tape.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 57, "name": "Double-Sided Tape", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Used for mounting components/modules onto surfaces.", "specs": "Adhesive on both sides, standard roll.", "image": "/products/insulation-tape.jpg", "sku_prefix": "GEN-TOL-1"},
    {"sno": 58, "name": "Safety Goggles", "category_slug": "stem-kits", "qty": 10, "cost_price": 250.0, "desc": "Protects eyes during soldering, cutting and fabrication work.", "specs": "Impact-resistant clear lens, adjustable strap.", "image": "/products/plastic-project-box.jpg", "sku_prefix": "GEN-TOL-1"},

    # 5. Display Projects
    {"sno": 59, "name": "Automatic Grass Cutter", "category_slug": "robotics-kits", "qty": 1, "cost_price": 7500.0, "desc": "A demo robot that autonomously trims grass using rotating blades and obstacle sensing.", "specs": "Motorized cutting blade, DC motor drive, obstacle avoidance sensors.", "image": "/products/car-kit-2-chassis-boards.jpg", "sku_prefix": "GEN-ROB-1"},
    {"sno": 60, "name": "Smart Pesticide Sprayer", "category_slug": "robotics-kits", "qty": 1, "cost_price": 8600.0, "desc": "A demo agricultural robot that sprays pesticide automatically over crops.", "specs": "Pump-based sprayer mechanism, motorized chassis, tank reservoir.", "image": "/products/car-kit-2-chassis-boards.jpg", "sku_prefix": "GEN-ROB-1"},
    {"sno": 61, "name": "Voice Control Robot", "category_slug": "robotics-kits", "qty": 1, "cost_price": 6000.0, "desc": "A robot that moves and performs actions based on voice commands.", "specs": "Voice recognition module, motor driver, wireless/Bluetooth control.", "image": "/products/otto-bot-kit.jpg", "sku_prefix": "GEN-ROB-1"},
    {"sno": 62, "name": "Humanoid Fire Fighter", "category_slug": "robotics-kits", "qty": 1, "cost_price": 5500.0, "desc": "A humanoid demo robot designed to simulate firefighting actions.", "specs": "Servo-driven humanoid frame, flame sensor integration.", "image": "/products/otto-bot-kit.jpg", "sku_prefix": "GEN-ROB-1"},
    {"sno": 63, "name": "Robotic Arms", "category_slug": "robotics-kits", "qty": 4, "cost_price": 2400.0, "desc": "Demonstration robotic arms used to teach pick-and-place and articulation concepts.", "specs": "Multi-servo articulated arm, gripper end-effector.", "image": "/products/robotic-arm-kit.jpg", "sku_prefix": "GEN-ROB-1"},
    {"sno": 64, "name": "6 Wheel Kit", "category_slug": "robotics-kits", "qty": 2, "cost_price": 1200.0, "desc": "A rugged 6-wheel drive chassis kit for building all-terrain robots.", "specs": "6-wheel drive chassis with DC motors, metal/plastic frame.", "image": "/products/6wheel-robot-kit.jpg", "sku_prefix": "GEN-ROB-1"},
    {"sno": 65, "name": "Spider Robot", "category_slug": "robotics-kits", "qty": 2, "cost_price": 1850.0, "desc": "A multi-legged walking robot used to demonstrate legged locomotion.", "specs": "Multi-servo leg mechanism, spider-like walking gait.", "image": "/products/spider-robot-kit.jpg", "sku_prefix": "GEN-ROB-1"},
]


@router.post("/sync-school-lab", status_code=status.HTTP_200_OK)
@router.get("/sync-school-lab", status_code=status.HTTP_200_OK)
async def sync_school_lab_products(db: DbSession):
    """Seed and sync all official GenBots School Lab products into the catalog with 40% margin."""
    from slugify import slugify
    import uuid
    from decimal import Decimal
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
    margin_mult = Decimal("1.40")

    for p_data in SCHOOL_LAB_DATA:
        p_slug = slugify(p_data["name"])
        cat_id = categories.get(p_data["category_slug"])
        cost = Decimal(str(p_data["cost_price"]))
        selling_price = round(cost * margin_mult, 2)
        compare_price = round(selling_price * Decimal("1.25"), 2)
        sku = f"{p_data.get('sku_prefix', 'GEN-PRT-1')}-{p_data['sno']}"
        seo_desc = f"Buy {p_data['name']} online at GenBots. {p_data['desc']} Specs: {p_data.get('specs', '')}. Best price with 40% margin pricing."
        
        # Check if already exists by slug, name or sku
        existing_res = await db.execute(
            select(Product).options(selectinload(Product.images)).where(
                (Product.slug == p_slug) | (Product.name == p_data["name"]) | (Product.sku == sku)
            )
        )
        product = existing_res.scalar_one_or_none()

        if product:
            # Update existing
            product.cost_price = cost
            product.price = selling_price
            product.compare_at_price = compare_price
            product.description = p_data["desc"]
            product.short_description = p_data["desc"][:200]
            product.meta_title = f"{p_data['name']} | GenBots Robotics Store"
            product.meta_description = seo_desc
            product.category_id = cat_id or product.category_id
            product.status = "active"
            product.sku = sku
            
            # Update or add primary image
            if not product.images:
                img = ProductImage(
                    id=uuid.uuid4(),
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
                sku=sku,
                description=p_data["desc"],
                short_description=p_data["desc"][:200],
                category_id=cat_id,
                brand_id=brand_id,
                cost_price=cost,
                price=selling_price,
                compare_at_price=compare_price,
                stock_quantity=p_data.get("qty", 10) * 5,
                status="active",
                is_featured=p_data["cost_price"] >= 500 or "Arduino" in p_data["name"] or "ESP32" in p_data["name"],
                tax_rate=Decimal("18.00"),
                meta_title=f"{p_data['name']} | GenBots Robotics Store",
                meta_description=seo_desc,
                tags=[p_data["category_slug"], "stem-lab", "innovation-lab"],
            )
            db.add(product)
            await db.flush()

            img = ProductImage(
                id=uuid.uuid4(),
                product_id=product.id,
                url=p_data["image"],
                alt_text=p_data["name"],
                is_primary=True,
                sort_order=0
            )
            db.add(img)

        synced_count += 1
    await db.commit()
    global_cache.clear()
    return {"message": f"Successfully synced all {synced_count} official Innovation Lab products with 40% margin pricing!", "count": synced_count}


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
    
    await db.commit()
    
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


@router.get("/{product_id}/reviews")
async def get_product_reviews(product_id: UUID, db: DbSession):
    """Get all reviews for a product."""
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    return [
        {
            "id": r.id,
            "product_id": r.product_id,
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "is_verified_purchase": r.is_verified_purchase,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "user": {
                "id": r.user.id if r.user else None,
                "first_name": r.user.first_name if r.user else "Customer",
                "last_name": r.user.last_name if r.user else "",
                "avatar_url": r.user.avatar_url if r.user else None,
            } if r.user else {"first_name": "Verified Customer", "last_name": ""}
        }
        for r in reviews
    ]


@router.post("/{product_id}/reviews", status_code=status.HTTP_201_CREATED)
async def create_product_review(
    product_id: UUID,
    data: ReviewCreate,
    db: DbSession,
    user: OptionalUser,
):
    """Submit a customer review for a product."""
    import uuid
    from app.models.user import User

    # Find product
    prod_res = await db.execute(select(Product).where(Product.id == product_id))
    product = prod_res.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user_id = user.id if user else None
    if not user_id:
        # Get fallback default user or admin
        any_user = await db.execute(select(User).limit(1))
        u = any_user.scalar_one_or_none()
        if u:
            user_id = u.id

    if not user_id:
        raise HTTPException(status_code=400, detail="User account required to submit review")

    review = Review(
        id=uuid.uuid4(),
        product_id=product_id,
        user_id=user_id,
        rating=data.rating,
        title=data.title or f"{data.rating}-Star Review",
        comment=data.comment or "",
        is_verified_purchase=True,
        is_approved=True,
    )
    db.add(review)
    await db.flush()

    # Recalculate product rating & count
    ratings_res = await db.execute(select(func.avg(Review.rating), func.count(Review.id)).where(Review.product_id == product_id))
    avg_r, count_r = ratings_res.first()
    product.avg_rating = float(round(avg_r, 1)) if avg_r else float(data.rating)
    product.review_count = count_r or 1
    await db.flush()

    global_cache.clear()

    return {
        "message": "Thank you! Your product review has been submitted successfully.",
        "review_id": review.id,
        "avg_rating": product.avg_rating,
        "review_count": product.review_count,
    }






import asyncio
import uuid
from decimal import Decimal
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import async_session_factory
from app.models.product import Product, ProductImage, ProductSpecification, Category, Brand

# All 65 items extracted from the official "Innovation Lab — Product List" PDF
INNOVATION_LAB_PRODUCTS = [
    # 1. Core Development Hardware
    {
        "sno": 1,
        "name": "Desktop 3D Printer",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 1,
        "cost_price": 18000.0,
        "unit_price_raw": "Rs.18,000",
        "desc": "Used for rapid prototyping of mechanical parts, enclosures and robot bodies via FDM printing.",
        "specs": "FDM technology, standard build volume, PLA/ABS filament compatible, USB/SD card input.",
        "image": "/products/3d-printer-stem.jpg",
        "sku_prefix": "GEN-DEV-1"
    },
    {
        "sno": 2,
        "name": "Arduino UNO",
        "category_slug": "arduino-products",
        "category_name": "Arduino Ecosystem",
        "qty": 40,
        "cost_price": 200.0,
        "unit_price_raw": "Rs.200",
        "desc": "Beginner-friendly microcontroller board for learning embedded programming and basic circuits.",
        "specs": "ATmega328P MCU, 14 digital I/O pins, 6 analog inputs, 5V logic, USB programming.",
        "image": "/products/arduino-uno-r3.jpg",
        "sku_prefix": "GEN-ARD-1"
    },
    {
        "sno": 3,
        "name": "ESP32 Development Board",
        "category_slug": "esp32-products",
        "category_name": "ESP32 Ecosystem",
        "qty": 20,
        "cost_price": 170.0,
        "unit_price_raw": "Rs.170",
        "desc": "Wi-Fi/Bluetooth enabled microcontroller for IoT projects requiring wireless connectivity.",
        "specs": "Dual-core 240MHz, Wi-Fi + BLE, 30+ GPIO pins, USB-to-serial programming.",
        "image": "/products/esp32-development-board.jpg",
        "sku_prefix": "GEN-ESP-1"
    },
    {
        "sno": 4,
        "name": "ESP32-C3 Development Board",
        "category_slug": "esp32-products",
        "category_name": "ESP32 Ecosystem",
        "qty": 20,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Compact, low-cost RISC-V based board for lightweight IoT applications.",
        "specs": "RISC-V single-core, Wi-Fi + BLE 5.0, USB-C, small form factor.",
        "image": "/products/esp32-development-board.jpg",
        "sku_prefix": "GEN-ESP-2"
    },

    # 2. Sensors & Modules
    {
        "sno": 5,
        "name": "Push Button",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 20.0,
        "unit_price_raw": "Rs.20",
        "desc": "Simple momentary switch used for user input in circuits.",
        "specs": "4-pin tactile switch, 12x12mm, momentary contact.",
        "image": "/products/push-button-module.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 6,
        "name": "LDR (Light Sensor)",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 25.0,
        "unit_price_raw": "Rs.25",
        "desc": "Detects ambient light intensity for light-based automation projects.",
        "specs": "Photoresistor, resistance varies with light, 5mm package.",
        "image": "/products/ldr-light-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 7,
        "name": "Tilt Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 50.0,
        "unit_price_raw": "Rs.50",
        "desc": "Detects orientation/tilt for motion or angle-based triggers.",
        "specs": "Ball-in-tube mercury-free switch, digital output.",
        "image": "/products/tilt-sensor-module.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 8,
        "name": "Sound Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 40.0,
        "unit_price_raw": "Rs.40",
        "desc": "Detects sound intensity/claps for sound-activated projects.",
        "specs": "Electret microphone with LM393 comparator, digital + analog output.",
        "image": "/products/sound-detection-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 9,
        "name": "Potentiometer",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 45.0,
        "unit_price_raw": "Rs.45",
        "desc": "Variable resistor used for manual analog input control (volume, speed, etc.).",
        "specs": "10K ohm rotary type, 3-pin, linear taper.",
        "image": "/products/potentiometer-10k.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 10,
        "name": "IR Obstacle Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 25.0,
        "unit_price_raw": "Rs.25",
        "desc": "Detects obstacles in front of robots using infrared reflection.",
        "specs": "IR LED + phototransistor pair, adjustable sensitivity, digital output.",
        "image": "/products/ir-obstacle-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 11,
        "name": "Temperature Sensor (LM35)",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 40.0,
        "unit_price_raw": "Rs.40",
        "desc": "Measures ambient temperature for monitoring/automation systems.",
        "specs": "Analog output, 10mV/°C, range -55°C to 150°C.",
        "image": "/products/lm35-temperature-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 12,
        "name": "Reed Switch Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 50.0,
        "unit_price_raw": "Rs.50",
        "desc": "Detects presence of a magnetic field, used in door/proximity sensing.",
        "specs": "Magnetically operated switch, normally open contact.",
        "image": "/products/reed-switch-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 13,
        "name": "Ultrasonic Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 65.0,
        "unit_price_raw": "Rs.65",
        "desc": "Measures distance using sound waves; widely used in robotics for obstacle detection.",
        "specs": "HC-SR04 type, 2cm-400cm range, trigger/echo pins.",
        "image": "/products/hc-sr04-ultrasonic.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 14,
        "name": "DHT11 Temperature & Humidity",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 60.0,
        "unit_price_raw": "Rs.60",
        "desc": "Measures both temperature and humidity for environmental monitoring.",
        "specs": "Digital output, 0-50°C, 20-90% RH range.",
        "image": "/products/dht11-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 15,
        "name": "Flame Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 25.0,
        "unit_price_raw": "Rs.25",
        "desc": "Detects presence of fire/flame for fire-safety related projects.",
        "specs": "IR flame detection, 760-1100nm wavelength, digital/analog output.",
        "image": "/products/flame-detection-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 16,
        "name": "Water Level Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 20.0,
        "unit_price_raw": "Rs.20",
        "desc": "Detects water level for tank monitoring and irrigation automation.",
        "specs": "Conductive trace strip, analog output.",
        "image": "/products/water-level-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 17,
        "name": "Touch Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 10.0,
        "unit_price_raw": "Rs.10",
        "desc": "Capacitive touch-based input switch for interactive projects.",
        "specs": "TTP223 module, digital output, touch-activated.",
        "image": "/products/touch-sensor-ttp223.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 18,
        "name": "I-Blink Module",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 130.0,
        "unit_price_raw": "Rs.130",
        "desc": "Specialized indicator/blink module used in signaling circuits.",
        "specs": "LED blink driver module, standard voltage input.",
        "image": "/products/i-blink-module.jpg",
        "sku_prefix": "GEN-MOD-1"
    },
    {
        "sno": 19,
        "name": "Relay Module",
        "category_slug": "home-automation",
        "category_name": "Home & Lab Automation",
        "qty": 30,
        "cost_price": 30.0,
        "unit_price_raw": "Rs.30",
        "desc": "Allows microcontrollers to switch high-power AC/DC loads safely.",
        "specs": "5V single-channel relay, optocoupler isolated, 10A contact rating.",
        "image": "/products/relay-module-5v.jpg",
        "sku_prefix": "GEN-MOD-1"
    },
    {
        "sno": 20,
        "name": "Servo Motor",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 30,
        "cost_price": 65.0,
        "unit_price_raw": "Rs.65",
        "desc": "Provides precise angular movement for robotic arms and mechanisms.",
        "specs": "SG90 micro servo, 180° rotation, PWM controlled.",
        "image": "/products/sg90-servo-motor.jpg",
        "sku_prefix": "GEN-MOT-1"
    },
    {
        "sno": 21,
        "name": "PIR Motion Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 60.0,
        "unit_price_raw": "Rs.60",
        "desc": "Detects human/animal movement using infrared radiation.",
        "specs": "HC-SR501 type, adjustable delay & sensitivity, 3-7m range.",
        "image": "/products/pir-motion-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 22,
        "name": "Soil Moisture Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 40.0,
        "unit_price_raw": "Rs.40",
        "desc": "Measures soil moisture content for smart agriculture/irrigation projects.",
        "specs": "Two-probe conductivity sensor, analog + digital output.",
        "image": "/products/soil-moisture-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 23,
        "name": "Rain Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 45.0,
        "unit_price_raw": "Rs.45",
        "desc": "Detects rainfall/water droplets for weather-based automation.",
        "specs": "Conductive PCB grid sensor, analog + digital output.",
        "image": "/products/rain-sensor-module.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 24,
        "name": "MQ2 Gas Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 90.0,
        "unit_price_raw": "Rs.90",
        "desc": "Detects LPG, smoke and combustible gases for safety systems.",
        "specs": "MQ-2 semiconductor sensor, analog output, preheat required.",
        "image": "/products/mq2-gas-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 25,
        "name": "Bluetooth Module (HC-05)",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 165.0,
        "unit_price_raw": "Rs.165",
        "desc": "Enables wireless serial communication between devices via Bluetooth.",
        "specs": "Bluetooth 2.0, master/slave mode, UART interface.",
        "image": "/products/hc05-bluetooth-module.jpg",
        "sku_prefix": "GEN-COM-1"
    },
    {
        "sno": 26,
        "name": "Hall Effect Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 25.0,
        "unit_price_raw": "Rs.25",
        "desc": "Detects magnetic field presence for speed/position sensing.",
        "specs": "Digital output, activates near magnetic field.",
        "image": "/products/hall-effect-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 27,
        "name": "Vibration Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 30.0,
        "unit_price_raw": "Rs.30",
        "desc": "Detects mechanical vibration/shock for security or monitoring projects.",
        "specs": "SW-420 module, digital output, adjustable sensitivity.",
        "image": "/products/vibration-sensor-sw420.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 28,
        "name": "IR Line Tracking Sensor",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 30,
        "cost_price": 24.0,
        "unit_price_raw": "Rs.24",
        "desc": "Detects line contrast for line-following robots.",
        "specs": "IR reflective sensor, digital output, adjustable threshold.",
        "image": "/products/ir-line-tracking-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 29,
        "name": "RFID Module",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 75.0,
        "unit_price_raw": "Rs.75",
        "desc": "Enables contactless identification/access systems using RFID tags.",
        "specs": "RC522 13.56MHz reader/writer, SPI interface, includes tag & card.",
        "image": "/products/rfid-rc522-kit.jpg",
        "sku_prefix": "GEN-COM-1"
    },
    {
        "sno": 30,
        "name": "MQ135 Air Quality Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 90.0,
        "unit_price_raw": "Rs.90",
        "desc": "Detects air quality by sensing gases like ammonia, CO2, and smoke.",
        "specs": "MQ-135 semiconductor sensor, analog output.",
        "image": "/products/mq135-air-quality-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 31,
        "name": "BH1750 Light Intensity Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 95.0,
        "unit_price_raw": "Rs.95",
        "desc": "Provides precise digital ambient light intensity measurement in lux.",
        "specs": "I2C digital output, 1-65535 lux range.",
        "image": "/products/bh1750-light-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 32,
        "name": "BMP180 Barometric Pressure Sensor",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 38.0,
        "unit_price_raw": "Rs.38",
        "desc": "Measures atmospheric pressure and altitude for weather stations.",
        "specs": "I2C interface, 300-1100hPa range, includes temperature reading.",
        "image": "/products/bmp180-pressure-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 33,
        "name": "OLED Display Module",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 130.0,
        "unit_price_raw": "Rs.130",
        "desc": "Compact display for showing sensor data/text in embedded projects.",
        "specs": "0.96\" I2C OLED, 128x64 resolution, monochrome.",
        "image": "/products/oled-display-096.jpg",
        "sku_prefix": "GEN-DIS-1"
    },
    {
        "sno": 34,
        "name": "Motion Sensor (RCWL-0516)",
        "category_slug": "iot-sensors",
        "category_name": "IoT & Smart Sensors",
        "qty": 30,
        "cost_price": 60.0,
        "unit_price_raw": "Rs.60",
        "desc": "General-purpose microwave doppler motion detection module for automation projects.",
        "specs": "Digital output motion detector, adjustable sensitivity.",
        "image": "/products/rcwl0516-radar-sensor.jpg",
        "sku_prefix": "GEN-SEN-1"
    },
    {
        "sno": 35,
        "name": "Amplifier Module",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 180.0,
        "unit_price_raw": "Rs.180",
        "desc": "Amplifies audio signals for speaker output in sound-based projects.",
        "specs": "Class-D audio amplifier module, standard voltage input.",
        "image": "/products/pam8403-amplifier.jpg",
        "sku_prefix": "GEN-MOD-1"
    },

    # 3. Electronics Components & Accessories
    {
        "sno": 36,
        "name": "LED Assortment Kits",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 2.0,
        "unit_price_raw": "Rs.2",
        "desc": "Basic indicator LEDs for circuit prototyping and signaling.",
        "specs": "Assorted colors (Red/Green/Blue/Yellow), 5mm, standard forward voltage.",
        "image": "/products/rgb-led-5mm.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 37,
        "name": "PCB (0 PCB)",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 100,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Perforated prototyping board for soldering and permanent circuit builds.",
        "specs": "General-purpose zero PCB, standard hole spacing.",
        "image": "/products/dot-matrix-pcb.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 38,
        "name": "Resistor Kits",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Assorted resistors used for current-limiting and voltage division in circuits.",
        "specs": "Assorted values (typically 1Ω-1MΩ), 1/4W carbon film.",
        "image": "/products/resistor-kit-pack.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 39,
        "name": "Breadboards",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Solderless prototyping boards for temporary circuit assembly.",
        "specs": "830-point standard size breadboard.",
        "image": "/products/mb102-breadboard.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 40,
        "name": "Jumper Wire Sets",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 40.0,
        "unit_price_raw": "Rs.40",
        "desc": "Connecting wires for breadboard and module interconnections.",
        "specs": "Male-Male/Male-Female/Female-Female assorted sets.",
        "image": "/products/jumper-wire-male-male.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 41,
        "name": "Switches",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 2.0,
        "unit_price_raw": "Rs.2",
        "desc": "General-purpose on/off switches for power control in circuits.",
        "specs": "SPST toggle/slide switch, standard rating.",
        "image": "/products/push-button-module.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 42,
        "name": "Battery Holders",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 50,
        "cost_price": 20.0,
        "unit_price_raw": "Rs.20",
        "desc": "Holds batteries securely and provides connection points for power supply.",
        "specs": "AA/9V compatible holder with lead wires.",
        "image": "/products/battery-holder-18650.jpg",
        "sku_prefix": "GEN-PWR-1"
    },
    {
        "sno": 43,
        "name": "Rechargeable Batteries",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 50,
        "cost_price": 60.0,
        "unit_price_raw": "Rs.60",
        "desc": "Reusable power source for portable projects and robots.",
        "specs": "NiMH/Li-ion rechargeable cells, standard capacity.",
        "image": "/products/rechargeable-18650-battery.jpg",
        "sku_prefix": "GEN-PWR-1"
    },
    {
        "sno": 44,
        "name": "Battery Chargers",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 20,
        "cost_price": 60.0,
        "unit_price_raw": "Rs.60",
        "desc": "Used to recharge rechargeable batteries used in lab projects.",
        "specs": "Multi-slot charger compatible with AA/Li-ion cells.",
        "image": "/products/lipo-battery-b3-charger.jpg",
        "sku_prefix": "GEN-PWR-1"
    },
    {
        "sno": 45,
        "name": "USB Programming Cables",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 10,
        "cost_price": 20.0,
        "unit_price_raw": "Rs.20",
        "desc": "Used to connect and program microcontroller boards via USB.",
        "specs": "USB-A to Micro-USB/Type-C, standard data cable.",
        "image": "/products/usb-programming-cable.jpg",
        "sku_prefix": "GEN-PRT-1"
    },
    {
        "sno": 46,
        "name": "Power Supply Modules",
        "category_slug": "electronics-components",
        "category_name": "Electronics & Accessories",
        "qty": 30,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Regulates voltage for powering breadboard circuits.",
        "specs": "Breadboard power supply module, 3.3V/5V dual output.",
        "image": "/products/extension-board.jpg",
        "sku_prefix": "GEN-PWR-1"
    },

    # 4. Fabrication & Assembly Tools
    {
        "sno": 47,
        "name": "Heat Gun",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 2,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used for heat-shrink tubing and desoldering applications.",
        "specs": "Dual temperature settings, standard household voltage.",
        "image": "/products/hot-glue-gun.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 48,
        "name": "Glue Gun",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 5,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used for quick mechanical bonding in prototyping and enclosures.",
        "specs": "Hot melt glue gun, standard glue stick size.",
        "image": "/products/hot-glue-gun.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 49,
        "name": "Soldering Iron Kit",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Essential tool for soldering electronic components onto PCBs.",
        "specs": "30-60W adjustable iron with stand, solder wire & accessories.",
        "image": "/products/soldering-iron-kit.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 50,
        "name": "Screwdriver Kit",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used for assembling/disassembling mechanical and electronic enclosures.",
        "specs": "Precision multi-bit screwdriver set.",
        "image": "/products/precision-screwdriver-kit.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 51,
        "name": "Wire Stripper",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used to strip insulation from wires for connections.",
        "specs": "Adjustable multi-gauge wire stripper/cutter.",
        "image": "/products/automatic-wire-stripper.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 52,
        "name": "Cutting Plier",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used for cutting wires and component leads.",
        "specs": "Standard diagonal cutting plier.",
        "image": "/products/long-nose-plier.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 53,
        "name": "Long Nose Plier",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used for gripping and bending wires in tight spaces.",
        "specs": "Standard long-nose (needle-nose) plier.",
        "image": "/products/long-nose-plier.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 54,
        "name": "Digital Multimeter",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 5,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used to measure voltage, current, resistance and continuity in circuits.",
        "specs": "Digital display, DC/AC voltage, current & resistance measurement.",
        "image": "/products/dt830d-digital-multimeter.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 55,
        "name": "Helping Hand Tool",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Holds PCBs/components steady during soldering work.",
        "specs": "Adjustable arms with alligator clips and magnifier.",
        "image": "/products/soldering-iron-kit.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 56,
        "name": "Electrical Tape",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used for insulating wire connections and joints.",
        "specs": "PVC insulation tape, standard roll.",
        "image": "/products/insulation-tape.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 57,
        "name": "Double-Sided Tape",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Used for mounting components/modules onto surfaces.",
        "specs": "Adhesive on both sides, standard roll.",
        "image": "/products/insulation-tape.jpg",
        "sku_prefix": "GEN-TOL-1"
    },
    {
        "sno": 58,
        "name": "Safety Goggles",
        "category_slug": "stem-kits",
        "category_name": "STEM & Robotics Kits",
        "qty": 10,
        "cost_price": 250.0,  # N/A in PDF -> 250
        "unit_price_raw": "N/A",
        "desc": "Protects eyes during soldering, cutting and fabrication work.",
        "specs": "Impact-resistant clear lens, adjustable strap.",
        "image": "/products/plastic-project-box.jpg",
        "sku_prefix": "GEN-TOL-1"
    },

    # 5. Display Projects
    {
        "sno": 59,
        "name": "Automatic Grass Cutter",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 1,
        "cost_price": 7500.0,
        "unit_price_raw": "Rs.7,500",
        "desc": "A demo robot that autonomously trims grass using rotating blades and obstacle sensing.",
        "specs": "Motorized cutting blade, DC motor drive, obstacle avoidance sensors.",
        "image": "/products/car-kit-2-chassis-boards.jpg",
        "sku_prefix": "GEN-ROB-1"
    },
    {
        "sno": 60,
        "name": "Smart Pesticide Sprayer",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 1,
        "cost_price": 8600.0,
        "unit_price_raw": "Rs.8,600",
        "desc": "A demo agricultural robot that sprays pesticide automatically over crops.",
        "specs": "Pump-based sprayer mechanism, motorized chassis, tank reservoir.",
        "image": "/products/car-kit-2-chassis-boards.jpg",
        "sku_prefix": "GEN-ROB-1"
    },
    {
        "sno": 61,
        "name": "Voice Control Robot",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 1,
        "cost_price": 6000.0,
        "unit_price_raw": "Rs.6,000",
        "desc": "A robot that moves and performs actions based on voice commands.",
        "specs": "Voice recognition module, motor driver, wireless/Bluetooth control.",
        "image": "/products/otto-bot-kit.jpg",
        "sku_prefix": "GEN-ROB-1"
    },
    {
        "sno": 62,
        "name": "Humanoid Fire Fighter",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 1,
        "cost_price": 5500.0,
        "unit_price_raw": "Rs.5,500",
        "desc": "A humanoid demo robot designed to simulate firefighting actions.",
        "specs": "Servo-driven humanoid frame, flame sensor integration.",
        "image": "/products/otto-bot-kit.jpg",
        "sku_prefix": "GEN-ROB-1"
    },
    {
        "sno": 63,
        "name": "Robotic Arms",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 4,
        "cost_price": 2400.0,
        "unit_price_raw": "Rs.2,400",
        "desc": "Demonstration robotic arms used to teach pick-and-place and articulation concepts.",
        "specs": "Multi-servo articulated arm, gripper end-effector.",
        "image": "/products/robotic-arm-kit.jpg",
        "sku_prefix": "GEN-ROB-1"
    },
    {
        "sno": 64,
        "name": "6 Wheel Kit",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 2,
        "cost_price": 1200.0,
        "unit_price_raw": "Rs.1,200",
        "desc": "A rugged 6-wheel drive chassis kit for building all-terrain robots.",
        "specs": "6-wheel drive chassis with DC motors, metal/plastic frame.",
        "image": "/products/6wheel-robot-kit.jpg",
        "sku_prefix": "GEN-ROB-1"
    },
    {
        "sno": 65,
        "name": "Spider Robot",
        "category_slug": "robotics-kits",
        "category_name": "Robotics & Kits",
        "qty": 2,
        "cost_price": 1850.0,
        "unit_price_raw": "Rs.1,850",
        "desc": "A multi-legged walking robot used to demonstrate legged locomotion.",
        "specs": "Multi-servo leg mechanism, spider-like walking gait.",
        "image": "/products/spider-robot-kit.jpg",
        "sku_prefix": "GEN-ROB-1"
    },
]

async def sync_products():
    margin_multiplier = Decimal("1.40")  # 40% margin added to actual cost price

    async with async_session_factory() as db:
        # Ensure categories exist
        cats_dict = {}
        all_cats = (await db.execute(select(Category))).scalars().all()
        for c in all_cats:
            cats_dict[c.slug] = c.id

        category_defs = [
            {"slug": "stem-kits", "name": "STEM & Robotics Kits", "desc": "STEM lab kits, 3D printers and tools"},
            {"slug": "arduino-products", "name": "Arduino Ecosystem", "desc": "Official and compatible Arduino boards & shields"},
            {"slug": "esp32-products", "name": "ESP32 Ecosystem", "desc": "ESP32 and ESP8266 IoT development boards"},
            {"slug": "iot-sensors", "name": "IoT & Smart Sensors", "desc": "Electronic sensors, modules and transducers"},
            {"slug": "electronics-components", "name": "Electronics & Accessories", "desc": "Components, breadboards, wires and passives"},
            {"slug": "robotics-kits", "name": "Robotics & Kits", "desc": "Robot chassis, robotic arms, servos and kits"},
            {"slug": "home-automation", "name": "Home & Lab Automation", "desc": "Relays, controllers and smart switching modules"},
        ]

        for cat_def in category_defs:
            if cat_def["slug"] not in cats_dict:
                new_cat = Category(
                    id=uuid.uuid4(),
                    name=cat_def["name"],
                    slug=cat_def["slug"],
                    description=cat_def["desc"],
                    is_active=True
                )
                db.add(new_cat)
                await db.flush()
                cats_dict[cat_def["slug"]] = new_cat.id
                print(f"Created category: {cat_def['name']}")

        # Ensure Brand
        brand_res = await db.execute(select(Brand).limit(1))
        brand = brand_res.scalar_one_or_none()
        if not brand:
            brand = Brand(
                id=uuid.uuid4(),
                name="GenBots",
                slug="genbots",
                description="Official GenBots Hardware & Robotics Catalog",
                is_active=True
            )
            db.add(brand)
            await db.flush()
        brand_id = brand.id

        # Loop through all 65 products
        updated_count = 0
        created_count = 0

        for item in INNOVATION_LAB_PRODUCTS:
            cost = Decimal(str(item["cost_price"]))
            selling_price = round(cost * margin_multiplier, 2)
            compare_price = round(selling_price * Decimal("1.25"), 2)
            cat_id = cats_dict.get(item["category_slug"])
            slug = slugify(item["name"])
            sku = f"{item['sku_prefix']}-{item['sno']}"

            # SEO description & tags
            seo_desc = f"Buy {item['name']} online at GenBots. {item['desc']} Specs: {item['specs']}. Best price with 40% margin pricing."

            # Search existing product by slug, name or SKU
            existing = (await db.execute(
                select(Product).options(selectinload(Product.images), selectinload(Product.specifications)).where(
                    (Product.slug == slug) | (Product.name == item["name"]) | (Product.sku == sku)
                )
            )).scalar_one_or_none()

            if existing:
                # Update cost price, selling price, descriptions and stock
                existing.cost_price = cost
                existing.price = selling_price
                existing.compare_at_price = compare_price
                existing.description = item["desc"]
                existing.short_description = item["desc"][:250]
                existing.meta_title = f"{item['name']} | GenBots Robotics Store"
                existing.meta_description = seo_desc
                existing.category_id = cat_id or existing.category_id
                existing.brand_id = brand_id
                existing.sku = sku
                existing.status = "active"
                existing.stock_quantity = max(existing.stock_quantity, item["qty"] * 5)
                
                # Check images
                if not existing.images:
                    img = ProductImage(
                        id=uuid.uuid4(),
                        product_id=existing.id,
                        url=item["image"],
                        alt_text=item["name"],
                        is_primary=True,
                        sort_order=0
                    )
                    db.add(img)
                else:
                    existing.images[0].url = item["image"]
                    existing.images[0].alt_text = item["name"]

                updated_count += 1
            else:
                # Create new product
                new_prod = Product(
                    id=uuid.uuid4(),
                    name=item["name"],
                    slug=slug,
                    sku=sku,
                    cost_price=cost,
                    price=selling_price,
                    compare_at_price=compare_price,
                    tax_rate=Decimal("18.00"),
                    stock_quantity=item["qty"] * 5,
                    low_stock_threshold=5,
                    status="active",
                    is_featured=item["cost_price"] >= 500 or "Arduino" in item["name"] or "ESP32" in item["name"],
                    is_digital=False,
                    category_id=cat_id,
                    brand_id=brand_id,
                    short_description=item["desc"][:250],
                    description=item["desc"],
                    meta_title=f"{item['name']} | GenBots Robotics Store",
                    meta_description=seo_desc,
                    tags=[item["category_slug"], "stem-lab", "innovation-lab"],
                )
                db.add(new_prod)
                await db.flush()

                # Add Primary Image
                img = ProductImage(
                    id=uuid.uuid4(),
                    product_id=new_prod.id,
                    url=item["image"],
                    alt_text=item["name"],
                    is_primary=True,
                    sort_order=0
                )
                db.add(img)

                # Add Specification
                spec = ProductSpecification(
                    id=uuid.uuid4(),
                    product_id=new_prod.id,
                    key="Specification",
                    value=item["specs"][:500]
                )
                db.add(spec)
                created_count += 1

        await db.commit()
        print(f"✅ Sync complete! Created: {created_count}, Updated: {updated_count}, Total in catalog: {len(INNOVATION_LAB_PRODUCTS)}")

if __name__ == "__main__":
    asyncio.run(sync_products())

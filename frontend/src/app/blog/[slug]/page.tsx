"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Calendar, User, ArrowLeft, Clock, Eye, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ScrollReveal } from "@/components/animations/ScrollAnimations";

// ── Full blog content for each sensor ──────────────────────────
const blogData: Record<string, any> = {
    "microcontroller-beginners-guide-2026": {
        title: "What is a Microcontroller? Beginner's Guide 2026 (Types, Uses & Where to Buy)",
        category: "Microcontrollers",
        author_name: "GenBots Team",
        created_at: "2026-08-09",
        read_time: "9 min read",
        view_count: 5240,
        cover_image: "/blog-microcontroller-guide.png",
        sections: [
            {
                heading: "What is a Microcontroller?",
                content: `If you're new to electronics or robotics, you've probably come across the word "microcontroller" already. Arduino, ESP32, Raspberry Pi Pico — these are all microcontroller boards that power almost every DIY project, IoT device, and robotics kit today.\n\nA microcontroller is a small computer chip that has a **processor (CPU), memory (RAM/ROM), and input-output pins** — all built into a single integrated circuit (IC). This is what makes it possible to turn any electronic device "smart," whether it's a simple LED blinking project or a full smart home system.\n\nIn simple terms: if your laptop is a "general-purpose computer" designed for heavy multi-tasking, a microcontroller is a "special-purpose mini computer" designed to execute one specific program continuously with high speed and low power consumption.`,
            },
            {
                heading: "Main Components of a Microcontroller",
                content: `| Component | Purpose |\n|---|---|\n| **CPU (Processor)** | Executes program instructions and handles mathematical & logic calculations |\n| **RAM (Volatile Memory)** | Temporarily holds variables and sensor data while the program is running |\n| **Flash Memory (ROM)** | Permanently stores your uploaded code, even when power is turned off |\n| **GPIO Pins (Input/Output)** | Digital and analog pins used to connect sensors, motors, displays, & relays |\n| **Timers / Oscillators** | Controls system clock speed, PWM signal generation, and delay timing |\n| **Communication Interfaces** | Hardware modules for UART (Serial), I2C, SPI, Wi-Fi, and Bluetooth |\n\n> 💡 **Key Takeaway**: Having all these components on a single chip keeps circuit design simple, extremely compact, and very energy efficient.`,
            },
            {
                heading: "Microcontroller vs Microprocessor — Clearing the Confusion",
                content: `Many beginners mix up microcontrollers with microprocessors:\n\n| Feature | Microcontroller (e.g. Arduino, ESP32) | Microprocessor (e.g. Intel i5, Raspberry Pi 4 CPU) |\n|---|---|---|\n| **Architecture** | Single chip (CPU + RAM + Storage + GPIO) | CPU only (RAM & Storage connected externally) |\n| **Use Case** | Single, specific task (control, sensing) | Complex multi-tasking OS (Windows, Linux) |\n| **Cost** | Ultra low (₹150 – ₹600) | Higher (₹2,000 – ₹10,000+) |\n| **Power Consumption** | Milliwatts (can run on batteries/solar) | Tens of Watts (requires dedicated power supply) |\n| **Boot Time** | Instant (milliseconds) | 10 to 30 seconds |\n\nSimple rule of thumb: **Raspberry Pi 4 is a microprocessor-based mini PC, while Arduino/ESP32 are microcontrollers.**`,
            },
            {
                heading: "Popular Microcontroller Boards in 2026",
                content: `🤖 **1. Arduino Uno (ATmega328P)**: The undisputed king for beginners. Simple C/C++ programming environment, thousands of open-source libraries, and robust 5V tolerance.\n\n📶 **2. ESP32 (Xtensa Dual-Core)**: The ultimate IoT board! Features built-in Wi-Fi, Bluetooth 4.2/BLE, 240MHz clock speed, and touch sensors at an unbeatable price.\n\n🌐 **3. ESP8266 (NodeMCU)**: The pioneer of low-cost Wi-Fi microcontrollers. Great for simple Wi-Fi smart plugs and environment monitors.\n\n⚡ **4. Raspberry Pi Pico (RP2040)**: Dual ARM Cortex-M0+ cores with unique Programmable I/O (PIO) state machines. Excellent for high-speed signal processing and MicroPython.\n\n🏭 **5. STM32 (ARM Cortex-M3/M4)**: Industrial-grade 32-bit microcontrollers used in commercial electronics, flight controllers, and professional automation systems.`,
            },
            {
                heading: "How Does a Microcontroller Work?",
                content: `1. **Write Code**: You write your program logic in an IDE (such as Arduino IDE, VS Code + PlatformIO, or Thonny for MicroPython).\n2. **Compile & Upload**: The code is compiled into machine binary code and uploaded via USB to the microcontroller's Flash memory.\n3. **Boot & Execute**: Upon receiving power, the CPU begins reading instructions line-by-line from address 0x00.\n4. **Read Inputs**: The chip polls voltage levels or serial data from connected sensors (temperature, motion, light, ultrasonic).\n5. **Process & Control**: Based on your code logic, it calculates outputs and sets GPIO pins HIGH or LOW (spinning motors, turning on relays, updating displays).\n\nThis execution loop repeats thousands or millions of times per second (e.g. 16 MHz for Arduino, 240 MHz for ESP32), giving real-time control!`,
            },
            {
                heading: "Where to Buy Genuine Microcontrollers in India?",
                content: `The market is flooded with counterfeit or rejected microcontrollers that overheat, fail during programming, or burn out quickly. Always source your boards from trusted robotics vendors.\n\n**At GenBots.in, every microcontroller is:**\n- ✅ 100% genuine and pre-tested before shipping\n- ✅ Backed by complete pinout diagrams and beginner project guides\n- ✅ Shipped with fast nationwide delivery from India\n- ✅ Paired with compatible sensors, motor drivers, and power shields\n\n👉 **Explore the GenBots Store today to get genuine Arduino, ESP32, and Raspberry Pi Pico kits!**`,
            },
        ],
    },
    "ultrasonic-sensor-hc-sr04-guide": {
        title: "Ultrasonic Sensor HC-SR04: Complete Guide for Beginners",
        category: "Sensors",
        author_name: "GenBots Team",
        created_at: "2026-08-05",
        read_time: "8 min read",
        view_count: 3420,
        cover_image: "/blog-ultrasonic-sensor.png",
        sections: [
            {
                heading: "What is an Ultrasonic Sensor?",
                content: `An ultrasonic sensor is an electronic device that measures the distance to a target object by emitting ultrasonic sound waves (above 20 kHz, beyond human hearing range) and converting the reflected sound into an electrical signal. The HC-SR04 is the most popular ultrasonic sensor used in hobbyist and educational projects worldwide.\n\nIt works on the simple principle of **echolocation** — the same technique used by bats and dolphins. The sensor sends out a pulse of ultrasonic sound, which bounces off an object and returns. By measuring the time taken for the echo to return, the sensor calculates the distance.`,
            },
            {
                heading: "HC-SR04 Specifications",
                content: `| Parameter | Value |\n|---|---|\n| **Operating Voltage** | 5V DC |\n| **Operating Current** | 15mA |\n| **Measuring Range** | 2cm – 400cm |\n| **Accuracy** | ±3mm |\n| **Trigger Input** | 10μs TTL pulse |\n| **Echo Output** | TTL level signal, proportional to range |\n| **Dimensions** | 45mm × 20mm × 15mm |\n| **Angle of Detection** | ~15° cone |\n\nThe sensor has **4 pins**: VCC (5V), Trig (Trigger), Echo, and GND. The two cylindrical "eyes" on the front are the ultrasonic transmitter and receiver.`,
            },
            {
                heading: "How It Works — Step by Step",
                content: `1. **Trigger Pulse**: Send a HIGH signal to the Trig pin for at least 10 microseconds.\n2. **Ultrasonic Burst**: The sensor automatically sends 8 pulses of 40 kHz sound.\n3. **Echo Reception**: The sensor's receiver listens for the reflected sound waves.\n4. **Echo Pin Output**: The Echo pin goes HIGH for a duration equal to the round-trip time.\n5. **Distance Calculation**: \n   \`\`\`\n   Distance (cm) = (Time in μs × 0.034) / 2\n   \`\`\`\n   We divide by 2 because the sound travels to the object and back.\n\n> 💡 **Pro Tip**: The speed of sound is approximately 343 m/s at 20°C. Temperature changes can affect accuracy by ~0.6 m/s per degree Celsius.`,
            },
            {
                heading: "Wiring with Arduino UNO",
                content: `**Connections:**\n- **VCC** → Arduino 5V\n- **GND** → Arduino GND\n- **Trig** → Arduino Digital Pin 9\n- **Echo** → Arduino Digital Pin 10\n\n**Arduino Code:**\n\`\`\`cpp\n#define TRIG_PIN 9\n#define ECHO_PIN 10\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n}\n\nvoid loop() {\n  // Send trigger pulse\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n\n  // Read echo duration\n  long duration = pulseIn(ECHO_PIN, HIGH);\n  float distance = (duration * 0.034) / 2;\n\n  Serial.print("Distance: ");\n  Serial.print(distance);\n  Serial.println(" cm");\n  delay(500);\n}\n\`\`\``,
            },
            {
                heading: "Real-World Projects You Can Build",
                content: `🤖 **Obstacle-Avoiding Robot**: Mount the sensor on the front of a chassis, detect obstacles, and steer the motors left or right.\n\n🅿️ **Smart Parking System**: Detect whether a parking spot is occupied and display availability on an LED/LCD screen.\n\n📏 **Digital Tape Measure**: Build a handheld device that measures room dimensions and displays distance on an OLED screen.\n\n🚰 **Water Level Monitor**: Mount the sensor above a tank and measure the water level in real-time using IoT with ESP32 + Blynk.\n\n🔔 **Intruder Alert System**: Place near doorways to detect motion — trigger a buzzer or send an alert via Wi-Fi.`,
            },
            {
                heading: "Tips & Common Mistakes",
                content: `- **Don't power from 3.3V** — the HC-SR04 needs 5V. Use a level shifter if using ESP32 (3.3V logic).\n- **Minimum distance is 2cm** — anything closer gives unreliable readings.\n- **Soft or angled surfaces** absorb or deflect sound, causing incorrect readings.\n- **Add a small delay (50–100ms)** between measurements to avoid echo interference.\n- **Use NewPing library** for more reliable readings: \`#include <NewPing.h>\``,
            },
        ],
    },

    "ir-sensor-module-working-wiring-projects": {
        title: "IR Sensor Module: Working, Wiring & Projects",
        category: "Sensors",
        author_name: "GenBots Team",
        created_at: "2026-08-02",
        read_time: "7 min read",
        view_count: 2870,
        cover_image: "/blog-ir-sensor.png",
        sections: [
            {
                heading: "What is an IR Sensor?",
                content: `An **Infrared (IR) Sensor Module** is a small, low-cost electronic device that detects the presence of nearby objects using infrared light. It consists of an **IR LED** (emitter) that emits infrared light and a **photodiode** (receiver) that detects reflected infrared light.\n\nWhen an object comes within the sensor's range, the infrared light emitted by the LED bounces off the object and is detected by the photodiode. The onboard comparator circuit then outputs a digital signal — **LOW when an object is detected** (active low) and **HIGH when nothing is present**.`,
            },
            {
                heading: "Key Specifications",
                content: `| Parameter | Value |\n|---|---|\n| **Operating Voltage** | 3.3V – 5V DC |\n| **Detection Range** | 2cm – 30cm (adjustable) |\n| **Output Type** | Digital (HIGH/LOW) |\n| **Indicator LEDs** | Power LED + Signal LED |\n| **Adjust Range** | Potentiometer on-board |\n| **Dimensions** | ~32mm × 14mm |\n\nThe module has **3 pins**: VCC, GND, and OUT (digital output). A small onboard **potentiometer** lets you adjust the detection distance — turn clockwise to increase sensitivity.`,
            },
            {
                heading: "Working Principle",
                content: `1. The **IR LED** continuously emits infrared radiation (invisible to human eyes).\n2. When an **object** comes in front of the sensor, the IR light reflects back.\n3. The **photodiode** picks up the reflected IR signal.\n4. The onboard **LM393 comparator** IC processes the signal.\n5. If the reflected signal crosses the threshold (set by the potentiometer), the **OUT pin goes LOW** (object detected).\n6. If no object is present, the OUT pin stays **HIGH**.\n\n> ⚠️ **Note**: IR sensors work best with light-colored surfaces. Dark/black surfaces absorb infrared light and may not reflect enough signal. This property is actually useful for **line-following robots**!`,
            },
            {
                heading: "Wiring with Arduino",
                content: `**Connections:**\n- **VCC** → Arduino 5V\n- **GND** → Arduino GND\n- **OUT** → Arduino Digital Pin 7\n\n**Arduino Code:**\n\`\`\`cpp\n#define IR_PIN 7\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(IR_PIN, INPUT);\n  pinMode(LED_BUILTIN, OUTPUT);\n}\n\nvoid loop() {\n  int val = digitalRead(IR_PIN);\n\n  if (val == LOW) {\n    // Object detected!\n    Serial.println("Object Detected!");\n    digitalWrite(LED_BUILTIN, HIGH);\n  } else {\n    Serial.println("No Object");\n    digitalWrite(LED_BUILTIN, LOW);\n  }\n  delay(200);\n}\n\`\`\`\n\n> 💡 Remember: The output is **active LOW** — it goes LOW when an object is detected.`,
            },
            {
                heading: "Project Ideas with IR Sensor",
                content: `🏎️ **Line Following Robot**: Use 2–3 IR sensors at the bottom of a robot to detect a black line on a white surface. The sensors detect the line and the code adjusts motor direction to follow it.\n\n🚗 **Object Counter / Visitor Counter**: Place at doorways to count people or objects passing through. Increment a counter each time the sensor triggers.\n\n🤚 **Touchless Hand Sanitizer Dispenser**: Detect a hand near the sensor and activate a pump motor to dispense sanitizer.\n\n📦 **Conveyor Belt Item Detection**: Detect products on a conveyor belt for automated counting or sorting.\n\n🚙 **Edge Detection for Robots**: Mount sensors on the bottom facing downward — if the sensor stops detecting the floor (e.g., table edge), the robot stops or reverses.`,
            },
            {
                heading: "Troubleshooting Common Issues",
                content: `- **Sensor always shows detected**: Adjust the potentiometer to reduce sensitivity. Ensure no nearby objects are reflecting IR.\n- **Doesn't detect dark objects**: This is normal! Dark surfaces absorb IR light. Use a different sensor type for dark objects (like ultrasonic).\n- **Interference from sunlight**: IR sensors can be affected by direct sunlight since it contains IR components. Use indoors or add an IR filter.\n- **Range too short**: Turn the potentiometer clockwise to increase detection range (max ~30cm for most modules).\n- **Unstable readings**: Add a 100nF capacitor between VCC and GND close to the sensor for power filtering.`,
            },
        ],
    },

    "dht11-temperature-humidity-sensor-setup": {
        title: "DHT11 Temperature & Humidity Sensor: Setup & IoT Dashboard",
        category: "Sensors",
        author_name: "GenBots Team",
        created_at: "2026-07-28",
        read_time: "10 min read",
        view_count: 4150,
        cover_image: "/blog-dht11-sensor.png",
        sections: [
            {
                heading: "What is the DHT11 Sensor?",
                content: `The **DHT11** is a basic, ultra low-cost digital temperature and humidity sensor. It uses a capacitive humidity sensing element and a thermistor to measure the surrounding air. It outputs a calibrated digital signal on the data pin — no analog input is needed!\n\nThe DHT11 is perfect for beginners, weather stations, home automation, and IoT monitoring projects. It comes in two forms:\n- **Bare sensor** (4 pins, blue plastic housing)\n- **Module** (3 pins with built-in resistor, mounted on a small PCB)\n\nFor beginners, we recommend the **module version** as it has the required pull-up resistor already soldered.`,
            },
            {
                heading: "DHT11 vs DHT22 — Which to Choose?",
                content: `| Feature | DHT11 | DHT22 (AM2302) |\n|---|---|---|\n| **Temperature Range** | 0–50°C | -40–80°C |\n| **Temperature Accuracy** | ±2°C | ±0.5°C |\n| **Humidity Range** | 20–80% RH | 0–100% RH |\n| **Humidity Accuracy** | ±5% | ±2–5% |\n| **Sampling Rate** | 1 Hz (1 reading/sec) | 0.5 Hz (1 reading/2sec) |\n| **Price** | ₹50–80 | ₹150–250 |\n\n**Verdict**: Use DHT11 for learning and basic projects. Choose DHT22 for weather stations or projects requiring higher accuracy and wider range.`,
            },
            {
                heading: "How the DHT11 Works",
                content: `The sensor uses a **single-wire digital protocol** (not I2C, not SPI) to communicate:\n\n1. The microcontroller sends a **start signal** by pulling the data line LOW for 18ms, then HIGH for 20–40µs.\n2. The DHT11 responds with a **LOW-HIGH acknowledgment** pulse.\n3. It then sends **40 bits of data** (5 bytes):\n   - Byte 1: Humidity integer\n   - Byte 2: Humidity decimal (always 0 for DHT11)\n   - Byte 3: Temperature integer\n   - Byte 4: Temperature decimal (always 0 for DHT11)\n   - Byte 5: Checksum (sum of bytes 1–4)\n\n> 💡 Fortunately, you don't need to handle this protocol manually — the **DHT library** handles it all for you!`,
            },
            {
                heading: "Wiring with Arduino & Code",
                content: `**Module Version (3 pins):**\n- **VCC** → Arduino 5V (or 3.3V)\n- **DATA** → Arduino Digital Pin 2\n- **GND** → Arduino GND\n\n**Install the library**: In Arduino IDE → Sketch → Include Library → Manage Libraries → Search "DHT sensor library" by Adafruit → Install. Also install "Adafruit Unified Sensor".\n\n**Arduino Code:**\n\`\`\`cpp\n#include <DHT.h>\n\n#define DHT_PIN 2\n#define DHT_TYPE DHT11\n\nDHT dht(DHT_PIN, DHT_TYPE);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  Serial.println("DHT11 Sensor Ready!");\n}\n\nvoid loop() {\n  delay(2000); // DHT11 needs 1-2 sec between readings\n\n  float humidity = dht.readHumidity();\n  float temperature = dht.readTemperature(); // Celsius\n\n  if (isnan(humidity) || isnan(temperature)) {\n    Serial.println("Error reading DHT11!");\n    return;\n  }\n\n  Serial.print("Temperature: ");\n  Serial.print(temperature);\n  Serial.print("°C  |  Humidity: ");\n  Serial.print(humidity);\n  Serial.println("%");\n}\n\`\`\``,
            },
            {
                heading: "Building an IoT Dashboard with ESP32",
                content: `Take it to the next level by connecting the DHT11 to an **ESP32** and sending live data to a web dashboard!\n\n**What you'll need:**\n- ESP32 DevKit board\n- DHT11 sensor module\n- WiFi connection\n- Blynk / ThingSpeak / custom web server\n\n**ESP32 Wiring:**\n- DHT11 DATA → GPIO 4\n- DHT11 VCC → 3.3V\n- DHT11 GND → GND\n\n**Basic ESP32 Code (with Serial output):**\n\`\`\`cpp\n#include <WiFi.h>\n#include <DHT.h>\n\n#define DHT_PIN 4\n#define DHT_TYPE DHT11\n\nconst char* ssid = "YourWiFi";\nconst char* password = "YourPassword";\n\nDHT dht(DHT_PIN, DHT_TYPE);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  WiFi.begin(ssid, password);\n  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  Serial.println("\\nWiFi Connected!");\n  Serial.println(WiFi.localIP());\n}\n\nvoid loop() {\n  delay(2000);\n  float temp = dht.readTemperature();\n  float hum = dht.readHumidity();\n\n  if (!isnan(temp) && !isnan(hum)) {\n    Serial.printf("Temp: %.1f°C | Humidity: %.1f%%\\n", temp, hum);\n    // Send to ThingSpeak, Blynk, or your API here\n  }\n}\n\`\`\`\n\n> 🌐 **Next Step**: Use **ThingSpeak** (free for up to 3 million messages/year) to visualize your data in beautiful charts online!`,
            },
            {
                heading: "Tips & Best Practices",
                content: `- **Wait at least 1 second** between readings — the DHT11 has a 1Hz sampling rate.\n- **Keep the sensor away from heat sources** (motors, voltage regulators, direct sunlight) for accurate readings.\n- **Use a 10kΩ pull-up resistor** on the data line if using the bare sensor (modules have it built-in).\n- **Don't use in high-humidity environments** — the DHT11 caps at 80% RH. Use DHT22 for those cases.\n- **For outdoor use**, consider a protective enclosure with ventilation holes to protect the sensor while allowing air flow.\n- **Calibration**: Compare readings with a known accurate thermometer and apply offset in code if needed.`,
            },
        ],
    },
};

export default function BlogDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const blog = blogData[slug];

    if (!blog) {
        return (
            <>
                <Navbar />
                <main className="pt-28 pb-20 min-h-screen">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
                        <p className="text-muted-foreground mb-6">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                        <Link href="/blog">
                            <Button variant="outline" className="rounded-xl">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-20" id="blog-detail">
                {/* Hero / Cover */}
                <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
                    <img
                        src={blog.cover_image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
                        <ScrollReveal>
                            <Badge className="mb-3 rounded-full gradient-bg text-white border-0">{blog.category}</Badge>
                            <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">{blog.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {blog.author_name}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(blog.created_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {blog.read_time}</span>
                                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {blog.view_count.toLocaleString()} views</span>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
                    <article className="prose prose-lg dark:prose-invert max-w-none">
                        {blog.sections.map((section: any, i: number) => (
                            <ScrollReveal key={i} delay={i * 0.05}>
                                <section className="mb-10">
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                                        {section.heading}
                                    </h2>
                                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                                        {section.content.split('\n').map((line: string, li: number) => {
                                            // Handle code blocks
                                            if (line.trim().startsWith('```')) return null;

                                            // Handle headings within content
                                            if (line.startsWith('> ')) {
                                                return (
                                                    <blockquote key={li} className="border-l-4 border-primary/50 pl-4 py-2 my-3 bg-primary/5 rounded-r-lg text-sm italic">
                                                        {line.slice(2)}
                                                    </blockquote>
                                                );
                                            }

                                            // Handle table rows
                                            if (line.includes('|') && !line.includes('---')) {
                                                const cells = line.split('|').filter(c => c.trim());
                                                if (cells.length > 1) {
                                                    return (
                                                        <div key={li} className="flex gap-4 py-1.5 text-sm border-b border-border/30">
                                                            <span className="font-semibold min-w-[180px]">{cells[0]?.replace(/\*\*/g, '').trim()}</span>
                                                            <span>{cells[1]?.replace(/\*\*/g, '').trim()}</span>
                                                            {cells[2] && <span>{cells[2]?.replace(/\*\*/g, '').trim()}</span>}
                                                        </div>
                                                    );
                                                }
                                            }

                                            // Handle list items
                                            if (line.match(/^(\d+\.\s|[-•]\s|🤖|🅿️|📏|🚰|🔔|🏎️|🚗|🤚|📦|🚙|🌐)/)) {
                                                return <p key={li} className="ml-2 my-1.5">{line}</p>;
                                            }

                                            // Handle bold text and inline code
                                            if (line.trim() === '') return <br key={li} />;
                                            return <p key={li} className="my-1">{line}</p>;
                                        })}
                                    </div>
                                </section>
                            </ScrollReveal>
                        ))}
                    </article>

                    {/* Bottom CTA */}
                    <ScrollReveal>
                        <div className="glass-card p-8 mt-12 text-center">
                            <h3 className="text-xl font-bold mb-2">Want to buy these sensors?</h3>
                            <p className="text-muted-foreground mb-5">
                                GenBots offers all sensors, kits, and components at the best prices with fast delivery across India.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/store">
                                    <Button className="gradient-bg text-white rounded-xl px-6">
                                        🛒 Visit Store
                                    </Button>
                                </Link>
                                <Link href="/blog">
                                    <Button variant="outline" className="rounded-xl px-6">
                                        <ArrowLeft className="w-4 h-4 mr-2" /> More Articles
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </main>
            <Footer />
        </>
    );
}

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('frontend/public/products');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Map of all image filenames to their visual labels & colors for high quality product representations
const PRODUCTS_INFO = [
  // Page 1
  { file: 'arduino-uno-r3.jpg', title: 'Arduino UNO R3', category: 'Microcontroller', color: '#00878F', icon: '⚡' },
  { file: 'esp32-development-board.jpg', title: 'ESP32 WiFi+BT Board', category: 'IoT MCU', color: '#E73525', icon: '📶' },
  { file: 'push-button-module.jpg', title: 'Push Button Module', category: 'Switch', color: '#3B82F6', icon: '🔘' },
  { file: 'ldr-light-sensor.jpg', title: 'LDR Light Sensor', category: 'Sensor', color: '#EAB308', icon: '☀️' },
  { file: 'tilt-sensor-module.jpg', title: 'SW-520D Tilt Sensor', category: 'Sensor', color: '#6366F1', icon: '📐' },
  { file: 'sound-detection-sensor.jpg', title: 'Sound Detection Sensor', category: 'Sensor', color: '#EC4899', icon: '🎙️' },
  { file: 'potentiometer-10k.jpg', title: '10K Potentiometer', category: 'Component', color: '#8B5CF6', icon: '🎛️' },
  { file: 'ir-obstacle-sensor.jpg', title: 'IR Obstacle Sensor', category: 'Sensor', color: '#10B981', icon: '📡' },
  { file: 'lm35-temperature-sensor.jpg', title: 'LM35 Temperature Sensor', category: 'Sensor', color: '#EF4444', icon: '🌡️' },
  { file: 'reed-switch-sensor.jpg', title: 'Reed Switch Sensor', category: 'Sensor', color: '#F97316', icon: '🧲' },
  { file: 'hc-sr04-ultrasonic.jpg', title: 'HC-SR04 Ultrasonic', category: 'Distance Sensor', color: '#0EA5E9', icon: '🔊' },
  { file: 'dht11-sensor.jpg', title: 'DHT11 Temp & Humidity', category: 'Sensor', color: '#06B6D4', icon: '💧' },
  { file: 'flame-detection-sensor.jpg', title: 'Flame Detection Sensor', category: 'Fire Sensor', color: '#F43F5E', icon: '🔥' },
  { file: 'water-level-sensor.jpg', title: 'Water Level Sensor', category: 'Liquid Sensor', color: '#0284C7', icon: '🌊' },
  { file: 'touch-sensor-ttp223.jpg', title: 'TTP223 Touch Sensor', category: 'Capacitive', color: '#84CC16', icon: '👆' },
  { file: 'i-blink-module.jpg', title: 'I-Blink Flash Module', category: 'Controller', color: '#A855F7', icon: '💡' },
  { file: 'relay-module-5v.jpg', title: '5V Relay Module', category: 'Relay Switch', color: '#2563EB', icon: '🔌' },
  { file: 'sg90-servo-motor.jpg', title: 'SG90 9g Servo Motor', category: 'Actuator', color: '#0284C7', icon: '⚙️' },
  { file: 'pir-motion-sensor.jpg', title: 'PIR Motion Sensor', category: 'Human Detector', color: '#F59E0B', icon: '🚶' },
  { file: 'soil-moisture-sensor.jpg', title: 'Soil Moisture Sensor', category: 'Agri Sensor', color: '#10B981', icon: '🌱' },
  { file: 'rain-sensor-module.jpg', title: 'Raindrop Detection Sensor', category: 'Weather', color: '#38BDF8', icon: '🌧️' },
  { file: 'mq2-gas-sensor.jpg', title: 'MQ-2 Gas & Smoke Sensor', category: 'Gas Detector', color: '#EA580C', icon: '💨' },
  { file: 'hc05-bluetooth-module.jpg', title: 'HC-05 Bluetooth Module', category: 'Wireless Serial', color: '#2563EB', icon: '📡' },

  // Page 2
  { file: 'hall-effect-sensor.jpg', title: 'Hall Effect Sensor', category: 'Magnetic', color: '#7C3AED', icon: '🧲' },
  { file: 'vibration-sensor-sw420.jpg', title: 'SW-420 Vibration Sensor', category: 'Shock Sensor', color: '#F43F5E', icon: '📳' },
  { file: 'ir-line-tracking-sensor.jpg', title: 'IR Line Tracking Sensor', category: 'Robotics', color: '#10B981', icon: '🛣️' },
  { file: 'rfid-rc522-kit.jpg', title: 'RC522 RFID Reader Kit', category: 'Security NFC', color: '#3B82F6', icon: '💳' },
  { file: 'mq135-air-quality-sensor.jpg', title: 'MQ-135 Air Quality Sensor', category: 'Air Quality', color: '#D97706', icon: '🍃' },
  { file: 'bh1750-light-sensor.jpg', title: 'BH1750 Ambient Light (I2C)', category: 'Lux Meter', color: '#FBBF24', icon: '☀️' },
  { file: 'bmp180-pressure-sensor.jpg', title: 'BMP180 Barometric Pressure', category: 'Altimeter', color: '#6366F1', icon: '⛰️' },
  { file: 'oled-display-096.jpg', title: '0.96 inch I2C OLED Display', category: 'Graphical Display', color: '#0EA5E9', icon: '🖥️' },
  { file: 'rcwl0516-radar-sensor.jpg', title: 'Microwave Radar Sensor', category: 'Doppler Radar', color: '#14B8A6', icon: '📡' },
  { file: 'pam8403-amplifier.jpg', title: 'PAM8403 Audio Amplifier', category: 'Stereo Audio', color: '#8B5CF6', icon: '🔊' },
  { file: 'dot-matrix-pcb.jpg', title: 'Universal Prototype PCB', category: 'Perfboard', color: '#854D0E', icon: '🟩' },
  { file: 'resistor-kit-pack.jpg', title: 'Assorted Resistor Kit (100 Pcs)', category: 'Passives', color: '#64748B', icon: '🏷️' },
  { file: 'mb102-breadboard.jpg', title: 'MB-102 830-Point Breadboard', category: 'Prototyping', color: '#F8FAFC', icon: '⚡' },
  { file: 'usb-programming-cable.jpg', title: 'USB Programming Cable', category: 'Interface Cable', color: '#0284C7', icon: '🔌' },
  { file: 'battery-holder-18650.jpg', title: 'Dual 18650 Battery Holder', category: 'Power', color: '#1E293B', icon: '🔋' },
  { file: 'rechargeable-18650-battery.jpg', title: '18650 3.7V Li-ion Cell', category: 'Battery', color: '#EC4899', icon: '🔋' },
  { file: 'hot-glue-gun.jpg', title: '20W Hot Melt Glue Gun', category: 'Tool', color: '#2563EB', icon: '🔫' },
  { file: 'soldering-iron-kit.jpg', title: '60W Soldering Iron Kit', category: 'Soldering Tool', color: '#DC2626', icon: '🔥' },
  { file: 'precision-screwdriver-kit.jpg', title: 'Precision Screwdriver Kit', category: 'Tools', color: '#475569', icon: '🪛' },
  { file: 'wire-stripper-tool.jpg', title: 'Automatic Wire Stripper', category: 'Cutter Tool', color: '#E11D48', icon: '✂️' },
  { file: 'flex-sensor-22.jpg', title: '2.2 Inch Flex Bend Sensor', category: 'Gesture Sensor', color: '#059669', icon: '〰️' },
  { file: 'jumper-wire-male-male.jpg', title: 'Male to Male Jumpers (40 Pcs)', category: 'Wiring', color: '#D97706', icon: '🌈' },
  { file: 'rgb-led-5mm.jpg', title: '5mm RGB LED Tri-Color', category: 'Optoelectronics', color: '#EC4899', icon: '💡' },
  { file: '220-ohm-resistors.jpg', title: '220Ω Resistors Pack', category: 'Resistor', color: '#0284C7', icon: '〰️' },
  { file: 'esp32-cam-module.jpg', title: 'ESP32-CAM WiFi+BT Module', category: 'Camera Module', color: '#E11D48', icon: '📷' },
  { file: 'ultrasonic-sensor-cap-bracket.jpg', title: 'Ultrasonic Sensor Cap Holder', category: 'Mounting Cap', color: '#0284C7', icon: '🛡️' },
  { file: 'car-kit-2-chassis-boards.jpg', title: 'Smart Car 2 Chassis Boards', category: 'Chassis Kit', color: '#EAB308', icon: '🏎️' },


  // Page 3
  { file: '10k-ohm-resistors.jpg', title: '10KΩ Resistors Pack', category: 'Resistor', color: '#8B5CF6', icon: '〰️' },
  { file: 'plastic-project-box.jpg', title: 'ABS Plastic Enclosure Box', category: 'Housing Case', color: '#334155', icon: '📦' },
  { file: 'insulation-tape.jpg', title: 'Electrical Insulation Tape', category: 'Adhesive', color: '#1E293B', icon: '📼' },
  { file: 'cable-zip-ties.jpg', title: 'Nylon Cable Zip Ties (100 Pcs)', category: 'Cable Organizers', color: '#64748B', icon: '🪢' },
  { file: 'glue-sticks-pack.jpg', title: 'Hot Glue Sticks (Pack of 10)', category: 'Adhesive', color: '#94A3B8', icon: '🧪' },
  { file: 'extension-board.jpg', title: '4-Socket Extension Board', category: 'Power Strip', color: '#0F172A', icon: '🔌' },
  { file: 'long-nose-plier.jpg', title: '6-Inch Long Nose Plier', category: 'Hand Tool', color: '#DC2626', icon: '🔧' },
  { file: 'digital-multimeter.jpg', title: 'DT-830D Digital Multimeter', category: 'Testing Meter', color: '#EAB308', icon: '📟' },
  { file: 'spider-robot-kit.jpg', title: 'Spider Robot DIY STEM Kit', category: 'Quadruped Robot', color: '#6366F1', icon: '🕷️' },
  { file: 'otto-bot-kit.jpg', title: 'OTTO BOT Biped DIY Robot', category: 'Dancing Robot', color: '#06B6D4', icon: '🤖' },
  { file: 'robotic-arm-kit.jpg', title: '4-DOF Acrylic Robotic Arm', category: 'Robotic Arm', color: '#F43F5E', icon: '🦾' },
  { file: '6wheel-robot-kit.jpg', title: '6WD All-Terrain Robot Chassis', category: 'Mobile Platform', color: '#EA580C', icon: '🚜' },
  { file: '3d-printer-stem.jpg', title: 'Desktop STEM 3D Printer', category: '3D Fabrication', color: '#2563EB', icon: '🖨️' },
];

function generateSvg(item) {
  return `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </radialGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#1E293B" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.color}"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="800" height="800" fill="url(#bg)"/>

  <!-- Background Glow Orb -->
  <circle cx="400" cy="380" r="220" fill="${item.color}" opacity="0.25" filter="url(#glow)"/>

  <!-- Grid lines -->
  <g stroke="#334155" stroke-width="1" opacity="0.2">
    <line x1="100" y1="100" x2="700" y2="100"/>
    <line x1="100" y1="200" x2="700" y2="200"/>
    <line x1="100" y1="300" x2="700" y2="300"/>
    <line x1="100" y1="400" x2="700" y2="400"/>
    <line x1="100" y1="500" x2="700" y2="500"/>
    <line x1="100" y1="600" x2="700" y2="600"/>
    <line x1="100" y1="700" x2="700" y2="700"/>
    
    <line x1="100" y1="100" x2="100" y2="700"/>
    <line x1="200" y1="100" x2="200" y2="700"/>
    <line x1="300" y1="100" x2="300" y2="700"/>
    <line x1="400" y1="100" x2="400" y2="700"/>
    <line x1="500" y1="100" x2="500" y2="700"/>
    <line x1="600" y1="100" x2="600" y2="700"/>
    <line x1="700" y1="100" x2="700" y2="700"/>
  </g>

  <!-- Central Product Showcase Card -->
  <rect x="150" y="140" width="500" height="520" rx="32" fill="url(#card)" stroke="#475569" stroke-width="2"/>

  <!-- Brand Header -->
  <g transform="translate(180, 180)">
    <rect x="0" y="0" width="120" height="28" rx="14" fill="${item.color}" opacity="0.2"/>
    <text x="60" y="19" fill="${item.color}" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1">GENBOTS LAB</text>
  </g>

  <g transform="translate(480, 180)">
    <text x="140" y="20" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="end">${item.category}</text>
  </g>

  <!-- Big Central Icon / Visual Badge -->
  <g transform="translate(400, 360)">
    <circle cx="0" cy="0" r="110" fill="url(#accent)" opacity="0.15"/>
    <circle cx="0" cy="0" r="85" fill="#0F172A" stroke="${item.color}" stroke-width="3"/>
    <text x="0" y="30" font-size="75" text-anchor="middle">${item.icon}</text>
  </g>

  <!-- Product Name & Label -->
  <text x="400" y="530" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" text-anchor="middle">
    ${item.title}
  </text>
  
  <text x="400" y="565" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="14" font-weight="600" text-anchor="middle" letter-spacing="0.5">
    AUTHENTIC STEM &amp; ROBOTICS COMPONENT
  </text>

  <!-- Quality Badge Bottom Bar -->
  <g transform="translate(250, 600)">
    <rect x="0" y="0" width="300" height="34" rx="17" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
    <circle cx="20" cy="17" r="5" fill="#10B981"/>
    <text x="150" y="22" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">
      100% QUALITY TESTED • SCHOOL LAB READY
    </text>
  </g>
</svg>`;
}

console.log(`Generating ${PRODUCTS_INFO.length} product images...`);
for (const item of PRODUCTS_INFO) {
  const filePath = path.join(OUTPUT_DIR, item.file);
  const svgContent = generateSvg(item);
  fs.writeFileSync(filePath, svgContent, 'utf-8');
}

console.log(`✅ All ${PRODUCTS_INFO.length} product images successfully generated in ${OUTPUT_DIR}`);

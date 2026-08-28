import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function compressImageToDataUrl(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback to jpeg
        }
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const FALLBACK_IMAGES: Record<string, string> = {
  arduino: "/products/arduino-uno-r3.jpg",
  esp32: "/products/esp32-development-board.jpg",
  battery_holder: "/products/battery-holder-18650.jpg",
  battery: "/products/rechargeable-18650-battery.jpg",
  lipo: "/products/lithium-battery-74v.jpg",
  resistor: "/products/10k-ohm-resistors.jpg",
  resistor_pack: "/products/resistor-kit-pack.jpg",
  servo: "/products/sg90-servo-motor.jpg",
  motor: "/products/dc-gear-bo-motor-wheel.jpg",
  breadboard: "/products/mb102-breadboard.jpg",
  pcb: "/products/dot-matrix-pcb.jpg",
  wire: "/products/jumper-wire-male-male.jpg",
  usb_cable: "/products/usb-programming-cable.jpg",
  led: "/products/rgb-led-5mm.jpg",
  oled: "/products/oled-display-096.jpg",
  button: "/products/push-button-module.jpg",
  ultrasonic: "/products/hc-sr04-ultrasonic.jpg",
  temperature: "/products/dht11-sensor.jpg",
  gas: "/products/mq2-gas-sensor.jpg",
  motion: "/products/pir-motion-sensor.jpg",
  bluetooth: "/products/hc05-bluetooth-module.jpg",
  rfid: "/products/rfid-rc522-kit.jpg",
  sound: "/products/sound-detection-sensor.jpg",
  light: "/products/ldr-light-sensor.jpg",
  soil: "/products/soil-moisture-sensor.jpg",
  rain: "/products/rain-sensor-module.jpg",
  flame: "/products/flame-detection-sensor.jpg",
  tilt: "/products/tilt-sensor-module.jpg",
  touch: "/products/touch-sensor-ttp223.jpg",
  water: "/products/water-level-sensor.jpg",
  hall: "/products/hall-effect-sensor.jpg",
  amplifier: "/products/pam8403-amplifier.jpg",
  box: "/products/plastic-project-box.jpg",
  tape: "/products/insulation-tape.jpg",
  zip_ties: "/products/cable-zip-ties.jpg",
  glue_gun: "/products/hot-glue-gun.jpg",
  extension: "/products/extension-board.jpg",
  tools: "/products/soldering-iron-kit.jpg",
  multimeter: "/products/digital-multimeter.jpg",
  relay: "/products/relay-module-5v.jpg",
  robot_arm: "/products/robotic-arm-kit.jpg",
  spider_robot: "/products/spider-robot-kit.jpg",
  otto_robot: "/products/otto-bot-kit.jpg",
  robot_6wd: "/products/6wheel-robot-kit.jpg",
  printer_3d: "/products/3d-printer-stem.jpg",
  default: "/products/esp32-development-board.jpg",
}

export function getProductFallbackImage(nameOrProduct: unknown): string {
  if (!nameOrProduct) return FALLBACK_IMAGES.default
  const p = typeof nameOrProduct === "object" ? (nameOrProduct as Record<string, unknown>) : {}
  const rawName = typeof nameOrProduct === "string" ? nameOrProduct : String(p.name || p.title || p.product_name || "")
  const catObj = p.category as Record<string, unknown> | string | undefined
  const cat = typeof catObj === "object" && catObj !== null
    ? String(catObj.slug || catObj.name || "").toLowerCase()
    : String(catObj || "").toLowerCase()
  const name = rawName.toLowerCase()

  // 1. Batteries & Power
  if (name.includes("charger") || name.includes("b3") || name.includes("balance charger")) return "/products/lipo-battery-b3-charger.jpg"
  if (name.includes("holder") || name.includes("battery holder") || name.includes("slot")) return FALLBACK_IMAGES.battery_holder
  if (name.includes("lipo") || name.includes("li-po") || name.includes("2200") || name.includes("3s") || name.includes("7.4v") || name.includes("11.1v")) return "/products/lipo-battery-2200mah-3s.jpg"
  if (name.includes("battery") || name.includes("18650") || name.includes("lithium") || name.includes("cell") || name.includes("rechargeable") || name.includes("power")) return FALLBACK_IMAGES.battery

  // 2. Resistors & Passive Components
  if (name.includes("resistor kit") || name.includes("resistor pack") || name.includes("assorted resistor")) return FALLBACK_IMAGES.resistor_pack
  if (name.includes("resistor") || name.includes("ohm") || name.includes("10k") || name.includes("220r") || name.includes("carbon film")) return FALLBACK_IMAGES.resistor
  if (name.includes("breadboard") || name.includes("mb-102") || name.includes("mb102") || name.includes("solderless")) return FALLBACK_IMAGES.breadboard
  if (name.includes("pcb") || name.includes("perfboard") || name.includes("dot matrix") || name.includes("clad")) return FALLBACK_IMAGES.pcb
  if (name.includes("usb") || name.includes("type-b") || name.includes("programming cable")) return FALLBACK_IMAGES.usb_cable
  if (name.includes("jumper") || name.includes("wire") || name.includes("cable") || name.includes("ribbon") || name.includes("pin male") || name.includes("pin female")) return FALLBACK_IMAGES.wire
  if (name.includes("led") || name.includes("rgb") || name.includes("diode") || name.includes("flasher") || name.includes("i-blink")) return FALLBACK_IMAGES.led
  if (name.includes("oled") || name.includes("display") || name.includes("lcd") || name.includes("screen") || name.includes("0.96")) return FALLBACK_IMAGES.oled
  if (name.includes("button") || name.includes("push") || name.includes("tactile") || name.includes("switch module")) return FALLBACK_IMAGES.button

  // 3. Motors & Actuators
  if (name.includes("servo") || name.includes("sg90") || name.includes("mg90") || name.includes("micro servo")) return FALLBACK_IMAGES.servo
  if (name.includes("motor") || name.includes("bo motor") || name.includes("gear motor") || name.includes("wheel") || name.includes("chassis")) return FALLBACK_IMAGES.motor

  // 4. Sensors
  if (name.includes("ultrasonic") || name.includes("sonar") || name.includes("hc-sr04") || name.includes("distance sensor")) return FALLBACK_IMAGES.ultrasonic
  if (name.includes("dht") || name.includes("dht11") || name.includes("temperature") || name.includes("humidity") || name.includes("lm35")) return FALLBACK_IMAGES.temperature
  if (name.includes("gas") || name.includes("smoke") || name.includes("mq-2") || name.includes("mq2") || name.includes("mq-135") || name.includes("mq135") || name.includes("air quality")) return FALLBACK_IMAGES.gas
  if (name.includes("pir") || name.includes("motion") || name.includes("radar") || name.includes("rcwl") || name.includes("presence")) return FALLBACK_IMAGES.motion
  if (name.includes("bluetooth") || name.includes("hc-05") || name.includes("hc05") || name.includes("wireless") || name.includes("transceiver")) return FALLBACK_IMAGES.bluetooth
  if (name.includes("rfid") || name.includes("rc522") || name.includes("nfc") || name.includes("mifare")) return FALLBACK_IMAGES.rfid
  if (name.includes("sound") || name.includes("acoustic") || name.includes("microphone") || name.includes("noise")) return FALLBACK_IMAGES.sound
  if (name.includes("ldr") || name.includes("light sensor") || name.includes("lux") || name.includes("bh1750") || name.includes("ambient")) return FALLBACK_IMAGES.light
  if (name.includes("soil") || name.includes("moisture") || name.includes("agriculture")) return FALLBACK_IMAGES.soil
  if (name.includes("rain") || name.includes("droplet") || name.includes("water level") || name.includes("depth")) return FALLBACK_IMAGES.rain
  if (name.includes("flame") || name.includes("fire detector")) return FALLBACK_IMAGES.flame
  if (name.includes("tilt") || name.includes("sw-520") || name.includes("sw520") || name.includes("vibration") || name.includes("sw-420") || name.includes("shock")) return FALLBACK_IMAGES.tilt
  if (name.includes("touch") || name.includes("ttp223") || name.includes("capacitive touch")) return FALLBACK_IMAGES.touch
  if (name.includes("hall") || name.includes("a3144") || name.includes("magnetic") || name.includes("reed") || name.includes("proximity")) return FALLBACK_IMAGES.hall
  if (name.includes("flex") || name.includes("bend")) return "/products/flex-sensor-22.jpg"
  if (name.includes("pressure") || name.includes("barometric") || name.includes("bmp180")) return "/products/bmp180-pressure-sensor.jpg"
  if (name.includes("ir") || name.includes("obstacle") || name.includes("tracking") || name.includes("tcrt5000")) return "/products/ir-obstacle-sensor.jpg"
  if (name.includes("sensor") || cat.includes("sensor") || cat.includes("iot")) return FALLBACK_IMAGES.ultrasonic

  // 5. Tools & Workshop
  if (name.includes("stripper") || name.includes("wire stripper")) return "/products/automatic-wire-stripper.jpg"
  if (name.includes("multimeter") || name.includes("tester") || name.includes("dt-830") || name.includes("dt830") || name.includes("voltmeter")) return "/products/dt830d-digital-multimeter.jpg"
  if (name.includes("amplifier") || name.includes("pam8403") || name.includes("audio")) return FALLBACK_IMAGES.amplifier
  if (name.includes("box") || name.includes("enclosure") || name.includes("case")) return FALLBACK_IMAGES.box
  if (name.includes("tape") || name.includes("insulation")) return FALLBACK_IMAGES.tape
  if (name.includes("zip") || name.includes("tie") || name.includes("fastener")) return FALLBACK_IMAGES.zip_ties
  if (name.includes("glue") || name.includes("stick") || name.includes("hot melt")) return FALLBACK_IMAGES.glue_gun
  if (name.includes("extension") || name.includes("multi-plug") || name.includes("socket")) return FALLBACK_IMAGES.extension
  if (name.includes("plier") || name.includes("nose plier") || name.includes("cutter") || name.includes("screwdriver") || name.includes("tool")) return "/products/long-nose-plier.jpg"
  if (name.includes("soldering") || name.includes("solder") || name.includes("iron")) return FALLBACK_IMAGES.tools
  if (name.includes("relay") || name.includes("home automation") || cat.includes("home")) return FALLBACK_IMAGES.relay

  // 6. Complete Robotics & Development Boards
  if (name.includes("spider") || name.includes("quadruped")) return FALLBACK_IMAGES.spider_robot
  if (name.includes("otto") || name.includes("biped") || name.includes("dancing robot")) return FALLBACK_IMAGES.otto_robot
  if (name.includes("arm") || name.includes("robotic arm") || name.includes("4-dof") || name.includes("claw")) return FALLBACK_IMAGES.robot_arm
  if (name.includes("6-wheel") || name.includes("6wd") || name.includes("all-terrain") || name.includes("robot kit") || cat.includes("robot")) return FALLBACK_IMAGES.robot_6wd
  if (name.includes("3d printer") || name.includes("printer") || name.includes("stem lab") || cat.includes("stem")) return FALLBACK_IMAGES.printer_3d
  if (name.includes("esp32") || name.includes("nodemcu") || name.includes("wroom") || cat.includes("esp32")) return FALLBACK_IMAGES.esp32
  if (name.includes("arduino") || name.includes("uno") || name.includes("mega") || name.includes("nano") || name.includes("atmega") || cat.includes("arduino")) return FALLBACK_IMAGES.arduino

  return FALLBACK_IMAGES.default
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string" || !url.trim()) return FALLBACK_IMAGES.default
  let cleanUrl = url.trim()

  // 1. Data URLs and Blob URLs are self-contained and ready to render
  if (cleanUrl.startsWith("data:") || cleanUrl.startsWith("blob:")) {
    return cleanUrl
  }

  // 2. Full HTTP/HTTPS URLs (Unsplash, S3, Cloudinary, CDN)
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl
  }

  // 3. Next.js public static assets (e.g. /products/...)
  if (cleanUrl.startsWith("/products/") || cleanUrl.startsWith("/logo") || cleanUrl.startsWith("/favicon") || cleanUrl.startsWith("/og-")) {
    return cleanUrl
  }

  // 4. Ensure leading slash for relative paths
  if (!cleanUrl.startsWith("/")) {
    cleanUrl = `/${cleanUrl}`
  }

  const isClient = typeof window !== "undefined"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""

  // 5. Handle backend upload paths
  if (cleanUrl.startsWith("/uploads/")) {
    if (apiUrl && !apiUrl.startsWith("/")) {
      try {
        const base = new URL(apiUrl).origin
        return `${base}${cleanUrl}`
      } catch {
        // fallback
      }
    }
    if (isClient && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      return `http://localhost:8000${cleanUrl}`
    }
  }

  if (cleanUrl.startsWith("/api/backend/uploads/")) {
    const rawPath = cleanUrl.replace("/api/backend", "")
    if (apiUrl && !apiUrl.startsWith("/")) {
      try {
        const base = new URL(apiUrl).origin
        return `${base}${rawPath}`
      } catch {
        // fallback
      }
    }
    if (isClient && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      return `http://localhost:8000${rawPath}`
    }
  }

  return cleanUrl
}

export function getProductImage(product: unknown): string {
  if (!product) return FALLBACK_IMAGES.default

  if (typeof product === "string" && product.trim()) {
    return resolveImageUrl(product)
  }

  const p = product as Record<string, unknown>
  let foundUrl = ""

  // 1. Check images array
  if (Array.isArray(p.images) && p.images.length > 0) {
    const primary = p.images.find((i: unknown) => i && typeof i === "object" && (i as Record<string, unknown>).is_primary)
    const target = primary || p.images[0]
    if (typeof target === "string" && target.trim()) {
      foundUrl = target.trim()
    } else if (target && typeof target === "object") {
      const t = target as Record<string, unknown>
      const u = t.url || t.image_url || t.src || t.link
      if (u && typeof u === "string" && u.trim()) {
        foundUrl = u.trim()
      }
    }
  } else if (typeof p.images === "string" && p.images.trim()) {
    const raw = p.images.trim()
    if (raw.startsWith("[")) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0]
          if (typeof first === "string") foundUrl = first
          else if (first && typeof first === "object") foundUrl = first.url || first.image_url || first.src || ""
        }
      } catch {
        // ignore
      }
    } else {
      foundUrl = raw
    }
  }

  // 2. Check direct properties
  if (!foundUrl) {
    if (typeof p.primary_image === "string" && p.primary_image.trim()) foundUrl = p.primary_image.trim()
    else if (typeof p.image === "string" && p.image.trim()) foundUrl = p.image.trim()
    else if (typeof p.image_url === "string" && p.image_url.trim()) foundUrl = p.image_url.trim()
    else if (typeof p.product_image === "string" && p.product_image.trim()) foundUrl = p.product_image.trim()
    else if (typeof p.cover_image === "string" && p.cover_image.trim()) foundUrl = p.cover_image.trim()
    else if (typeof p.thumbnail === "string" && p.thumbnail.trim()) foundUrl = p.thumbnail.trim()
    else if (typeof p.thumbnail_url === "string" && p.thumbnail_url.trim()) foundUrl = p.thumbnail_url.trim()
  }

  if (foundUrl) {
    return resolveImageUrl(foundUrl)
  }

  // 3. Smart contextual fallback by product name / category
  return getProductFallbackImage(p)
}

export const generateDocumentHtml = (order: Record<string, any>, docType: "invoice" | "purchase_order") => {
  const isInvoice = docType === "invoice";
  const docTitle = isInvoice ? "TAX INVOICE" : "PURCHASE ORDER";
  const docNumber = isInvoice
    ? `INV-${(order.order_number || order.id?.slice(0, 8) || "").replace("GB-", "")}`
    : `PO-${(order.order_number || order.id?.slice(0, 8) || "").replace("GB-", "")}`;
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = parseFloat(order.subtotal || (order.total_amount * 100 / 118).toString());
  const totalAmount = parseFloat(order.total_amount);
  const shippingAmount = parseFloat(order.shipping_amount || "0");
  const discountAmount = parseFloat(order.discount_amount || "0");

  const itemsHtml = items.length > 0
    ? items.map((item: Record<string, any>, i: number) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.product_name || "Product"}<br><span style="color:#6b7280;font-size:11px;">SKU: ${item.product_sku || "N/A"}</span></td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity || 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${parseFloat(item.unit_price || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${parseFloat(item.total_price || (item.unit_price * item.quantity).toString() || "0").toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="5" style="padding:20px;text-align:center;color:#6b7280;">Order items details not available</td></tr>`;

  const logoOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docTitle} - ${docNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; background: #fff; padding: 40px; }
    .doc-container { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 3px solid #7c3aed; }
    .logo-section h1 { font-size: 28px; font-weight: 800; color: #7c3aed; }
    .logo-section p { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .logo-section img { height: 60px; object-fit: contain; margin-bottom: 8px; }
    .doc-type { text-align: right; }
    .doc-type h2 { font-size: 24px; font-weight: 700; color: #1f2937; letter-spacing: 2px; }
    .doc-type .doc-num { font-size: 14px; color: #7c3aed; font-weight: 600; margin-top: 4px; }
    .doc-type .doc-date { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 32px; gap: 40px; }
    .party { flex: 1; }
    .party-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #7c3aed; font-weight: 700; margin-bottom: 8px; }
    .party-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .party-detail { font-size: 12px; color: #4b5563; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead { background: #f3f0ff; }
    thead th { padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; font-weight: 700; text-align: left; border-bottom: 2px solid #7c3aed; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    thead th:nth-child(3) { text-align: center; }
    .summary { display: flex; justify-content: flex-end; margin-bottom: 32px; }
    .summary-table { width: 300px; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .summary-row.total { border-top: 2px solid #7c3aed; padding-top: 12px; font-size: 16px; font-weight: 800; color: #7c3aed; }
    .summary-row .label { color: #6b7280; }
    .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; }
    .footer-grid { display: flex; justify-content: space-between; gap: 40px; }
    .footer-col h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; font-weight: 700; margin-bottom: 8px; }
    .footer-col p { font-size: 11px; color: #6b7280; line-height: 1.6; }
    .stamp { margin-top: 40px; text-align: right; }
    .stamp-box { display: inline-block; border: 2px dashed #7c3aed; border-radius: 8px; padding: 16px 32px; text-align: center; }
    .stamp-box .auth { font-size: 10px; color: #6b7280; margin-top: 8px; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-size: 80px; color: rgba(124,58,237,0.04); font-weight: 900; letter-spacing: 8px; pointer-events: none; z-index: 0; }
    .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 12px 24px; background: #7c3aed; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; z-index: 99; }
    .print-btn:hover { background: #6d28d9; }
    @media print { .print-btn { display: none; } .watermark { display: none; } @page { margin: 20mm; } }
  </style>
</head>
<body>
  <div class="watermark">GENBOTS</div>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Download PDF</button>
  <div class="doc-container">
    <div class="header">
      <div class="logo-section">
        <img src="${logoOrigin}/logo.jpg" alt="GenBots Logo" />
        <p>IoT • Robotics • AI Solutions</p>
      </div>
      <div class="doc-type">
        <h2>${docTitle}</h2>
        <div class="doc-num">${docNumber}</div>
        <div class="doc-date">Date: ${orderDate}</div>
        <div class="doc-date">Order: ${order.order_number || "#" + (order.id?.slice(0, 8) || "")}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">${isInvoice ? "From (Seller)" : "Buyer (GenBots)"}</div>
        <div class="party-name">GenBots Technology Pvt Ltd</div>
        <div class="party-detail">
          GenBots Technology Park<br>
          Sonipat, Haryana 131001, India<br>
          Email: billing@genbots.in<br>
          Phone: +91 92 110 67540
        </div>
      </div>
      <div class="party">
        <div class="party-label">${isInvoice ? "Bill To (Customer)" : "Vendor / Supplier"}</div>
        <div class="party-name">${order.shipping_name || order.user?.first_name || order.user?.email?.split("@")[0] || "Customer"}</div>
        <div class="party-detail">
          ${order.shipping_address_line1 || "Address on file"}<br>
          ${order.shipping_address_line2 ? order.shipping_address_line2 + "<br>" : ""}
          ${order.shipping_city || ""} ${order.shipping_state || ""} ${order.shipping_postal_code || ""}<br>
          ${order.shipping_country || "India"}<br>
          ${order.shipping_phone ? "Phone: " + order.shipping_phone : ""}
          ${order.user?.email ? "<br>Email: " + order.user.email : ""}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px;">#</th>
          <th>Item Description</th>
          <th style="width:80px;text-align:center;">Qty</th>
          <th style="width:120px;text-align:right;">Unit Price</th>
          <th style="width:120px;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-table">
        <div class="summary-row"><span class="label">Subtotal</span><span>₹${subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
        ${shippingAmount > 0 ? `<div class="summary-row"><span class="label">Shipping</span><span>₹${shippingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>` : `<div class="summary-row"><span class="label">Shipping</span><span style="color:#16a34a;">FREE</span></div>`}
        ${discountAmount > 0 ? `<div class="summary-row"><span class="label">Discount</span><span style="color:#dc2626;">-₹${discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>` : ""}
        <div class="summary-row total"><span>Total Amount</span><span>₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Payment Info</h4>
          <p>
            Method: ${(order.payment_method || "Online").toUpperCase()}<br>
            Status: ${(order.payment_status || "Pending").toUpperCase()}<br>
            ${order.payment_id ? "Txn ID: " + order.payment_id : ""}
          </p>
        </div>
        <div class="footer-col">
          <h4>Bank Details</h4>
          <p>
            GenBots Technology Pvt Ltd<br>
            A/C No: 1234567890123456<br>
            IFSC: HDFC0001234<br>
            Bank: HDFC Bank, Sonipat
          </p>
        </div>
        <div class="footer-col">
          <h4>Terms & Conditions</h4>
          <p>
            1. Goods once sold won't be taken back except defective.<br>
            2. Payment due within 7 working days.<br>
            3. Subject to Haryana jurisdiction.
          </p>
        </div>
      </div>
      <div class="stamp">
        <div class="stamp-box">
          <strong style="font-size:14px;color:#7c3aed;">GenBots Technology</strong>
          <div class="auth">Authorized Signatory</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export const generateInvoice = (order: Record<string, any>) => {
  if (typeof window === "undefined") return;
  const html = generateDocumentHtml(order, "invoice");
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
};

export const generatePurchaseOrder = (order: Record<string, any>) => {
  if (typeof window === "undefined") return;
  const html = generateDocumentHtml(order, "purchase_order");
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
};


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const FALLBACK_IMAGES: Record<string, string> = {
  iot: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  arduino: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&q=80",
  esp32: "https://images.unsplash.com/photo-1608564697071-ddf911bf41fb?w=800&q=80",
  robot: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
  stem: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
  ai: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  home: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
  default: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80",
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string" || !url.trim()) return FALLBACK_IMAGES.default
  let cleanUrl = url.trim()

  const isClient = typeof window !== "undefined"
  const isLocalHost = isClient
    ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    : (process.env.NODE_ENV === "development" || (process.env.NEXT_PUBLIC_API_URL || "").includes("localhost"))

  // If URL has localhost in production, strip it to relative
  if (!isLocalHost && cleanUrl.includes("localhost:8000")) {
    cleanUrl = cleanUrl.replace(/^https?:\/\/localhost:8000/, "")
  }

  // Already a full external/data URL (e.g. Unsplash, S3, data:image, blob:)
  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("data:") ||
    cleanUrl.startsWith("blob:")
  ) {
    return cleanUrl
  }

  // Ensure leading slash
  if (!cleanUrl.startsWith("/")) {
    cleanUrl = `/${cleanUrl}`
  }

  // If in local development, route uploads directly to FastAPI on port 8000
  if (isLocalHost && cleanUrl.startsWith("/uploads/")) {
    return `http://localhost:8000${cleanUrl}`
  }
  if (isLocalHost && cleanUrl.startsWith("/api/backend/uploads/")) {
    return `http://localhost:8000${cleanUrl.replace("/api/backend", "")}`
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
  } else if (typeof p.images === "string" && p.images.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(p.images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0]
        if (typeof first === "string") foundUrl = first
        else if (first && typeof first === "object") foundUrl = first.url || first.image_url || first.src || ""
      }
    } catch {
      // ignore
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

  // Smart fallback by category or name keyword
  const name = String(p.name || p.title || p.product_name || "").toLowerCase()
  const catObj = p.category as Record<string, unknown> | string | undefined
  const cat = typeof catObj === "object" && catObj !== null
    ? String(catObj.slug || catObj.name || "").toLowerCase()
    : String(catObj || "").toLowerCase()

  if (name.includes("arduino") || cat.includes("arduino")) return FALLBACK_IMAGES.arduino
  if (name.includes("esp32") || cat.includes("esp32")) return FALLBACK_IMAGES.esp32
  if (name.includes("robot") || cat.includes("robot")) return FALLBACK_IMAGES.robot
  if (name.includes("stem") || cat.includes("stem")) return FALLBACK_IMAGES.stem
  if (name.includes("ai") || cat.includes("ai")) return FALLBACK_IMAGES.ai
  if (name.includes("home") || cat.includes("home")) return FALLBACK_IMAGES.home
  if (name.includes("iot") || cat.includes("iot")) return FALLBACK_IMAGES.iot

  return FALLBACK_IMAGES.default
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


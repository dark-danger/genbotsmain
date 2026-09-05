interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand?: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  rating?: number;
  reviewCount?: number;
  url?: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  brand = "GenBots",
  price,
  currency = "INR",
  availability = "InStock",
  rating,
  reviewCount,
  url,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    sku,
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "Offer",
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: `https://schema.org/${availability}`,
      url: url || `https://thegenbots.in/store/${sku}`,
    },
    ...(rating && reviewCount
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating.toString(),
          reviewCount: reviewCount.toString(),
        },
      }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BlogJsonLdProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url?: string;
}

export function BlogJsonLd({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: BlogJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    author: { "@type": "Person", name: author },
    datePublished,
    dateModified: dateModified || datePublished,
    publisher: {
      "@type": "Organization",
      name: "GenBots",
      logo: { "@type": "ImageObject", url: "https://thegenbots.in/logo.png" },
    },
    ...(image ? { image } : {}),
    ...(url ? { mainEntityOfPage: { "@type": "WebPage", "@id": url } } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FaqJsonLdProps {
  faqs: { question: string; answer: string }[];
}

export function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "Brand"],
        "@id": "https://thegenbots.in/#organization",
        name: "GenBots",
        alternateName: ["TheGenBots", "GenBots India", "GenBots STEM & Robotics", "GenBots Sonipat"],
        url: "https://thegenbots.in",
        logo: "https://thegenbots.in/logo.png",
        image: "https://thegenbots.in/og-image.jpg",
        description:
          "GenBots is an MSME registered Indian robotics, IoT & STEM innovation lab enterprise founded by Yash in April 2026. Provider of turnkey school robotics labs, 65+ Arduino/ESP32 sensors and hardware kits, supplying Pan-India.",
        disambiguatingDescription:
          "GenBots (thegenbots.in) is an independent Indian STEM robotics & IoT hardware enterprise founded by Yash in Sonipat, Haryana (Govt. of India recognized MSME enterprise). It is completely independent and not affiliated with Genrobotics.",
        foundingDate: "2026-04",
        founder: {
          "@type": "Person",
          name: "Yash",
          jobTitle: "Founder & Lead Robotics Engineer",
        },
        knowsAbout: [
          "IoT Sensors and Automation",
          "STEM Robotics for Schools",
          "Arduino & ESP32 Microcontroller Kits",
          "School STEM Lab Setup India",
          "Electronic Components Supplier Sonipat",
          "Hands-on Robotics Training",
          "Pan-India Electronics Delivery",
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Sonipat",
          addressRegion: "Haryana",
          postalCode: "131001",
          addressCountry: "IN",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+91 92 110 67540",
            contactType: "customer support",
            email: "genbots000@gmail.com",
            availableLanguage: ["English", "Hindi"],
            areaServed: "IN",
          },
        ],
        sameAs: [
          "https://wa.me/919211067540",
          "https://thegenbots.in",
        ],
      },
      {
        "@type": ["LocalBusiness", "ElectronicsStore", "Store"],
        "@id": "https://thegenbots.in/#localbusiness",
        name: "GenBots - IoT Sensors, Robotics & STEM Lab Supplier",
        alternateName: ["GenBots Sonipat", "GenBots Electronics Store Sonipat"],
        url: "https://thegenbots.in",
        telephone: "+91 92 110 67540",
        email: "genbots000@gmail.com",
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: "Cash on Delivery, UPI, Net Banking, Credit Card, Debit Card",
        image: "https://thegenbots.in/og-image.jpg",
        logo: "https://thegenbots.in/logo.png",
        address: {
          "@type": "PostalAddress",
          streetAddress: "GenBots, Sonipat",
          addressLocality: "Sonipat",
          addressRegion: "Haryana",
          postalCode: "131001",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 28.9931,
          longitude: 77.0151,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:00",
            closes: "19:00",
          },
        ],
        areaServed: [
          { "@type": "City", name: "Sonipat" },
          { "@type": "AdministrativeArea", name: "Haryana" },
          { "@type": "AdministrativeArea", name: "Delhi NCR" },
          { "@type": "Country", name: "India" },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "IoT Sensors, Microcontrollers & Robotics Kits",
          itemListElement: [
            {
              "@type": "OfferCatalog",
              name: "IoT Sensors in Sonipat & Pan-India",
              description: "Ultrasonic, IR, PIR, DHT11 Temperature, Soil Moisture, Gas, Touch, and Color sensors with express delivery.",
            },
            {
              "@type": "OfferCatalog",
              name: "Microcontroller Boards",
              description: "Arduino Uno, Mega, Nano, ESP32 Wi-Fi + Bluetooth, ESP8266, Raspberry Pi Pico.",
            },
            {
              "@type": "OfferCatalog",
              name: "Turnkey School Robotics Labs",
              description: "Complete equipment, training, and curriculum for school STEM innovation labs.",
            },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://thegenbots.in/#website",
        url: "https://thegenbots.in",
        name: "GenBots",
        description: "IoT Sensors, Robotics Kits & AI Solutions Provider | Sonipat & Pan India",
        publisher: { "@id": "https://thegenbots.in/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://thegenbots.in/store?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}


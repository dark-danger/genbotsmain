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
        "@type": "Organization",
        "@id": "https://thegenbots.in/#organization",
        name: "GenBots",
        alternateName: ["TheGenBots", "GenBots India", "GenBots STEM & Robotics"],
        url: "https://thegenbots.in",
        logo: "https://thegenbots.in/logo.png",
        image: "https://thegenbots.in/og-image.jpg",
        description:
          "GenBots is an MSME registered Indian robotics, IoT & STEM innovation lab enterprise founded by Yash in April 2026. Provider of turnkey school robotics labs, Arduino/ESP32 hardware kits, and hands-on training.",
        disambiguatingDescription:
          "GenBots (thegenbots.in) is an independent Indian STEM robotics & IoT hardware enterprise founded by Yash in Sonipat, Haryana (Govt. of India recognized MSME enterprise). It is completely independent and not affiliated with Genrobotics.",
        foundingDate: "2026-04",
        founder: {
          "@type": "Person",
          name: "Yash",
          jobTitle: "Founder & Lead Robotics Engineer",
        },
        knowsAbout: [
          "STEM Robotics",
          "IoT Hardware & Sensors",
          "Arduino & ESP32 Microcontrollers",
          "School STEM Lab Setup",
          "Hands-on Robotics Training",
          "Home Automation",
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
        "@type": "WebSite",
        "@id": "https://thegenbots.in/#website",
        url: "https://thegenbots.in",
        name: "GenBots",
        description: "IoT, Robotics & AI Solutions Provider | India",
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


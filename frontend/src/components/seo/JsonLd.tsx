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
      url,
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
      logo: { "@type": "ImageObject", url: "https://genbots.in/logo.png" },
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
    "@type": "Organization",
    name: "GenBots",
    url: "https://genbots.in",
    logo: "https://genbots.in/logo.png",
    description:
      "India's leading IoT, Robotics & AI solutions company. Premium products for makers, students, and enterprises.",
    foundingDate: "2018",
    sameAs: [
      "https://twitter.com/genbots",
      "https://linkedin.com/company/genbots",
      "https://github.com/genbots",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bangalore",
      addressRegion: "Karnataka",
      postalCode: "560001",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-98765-43210",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

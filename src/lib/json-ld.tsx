export function JsonLd<T extends Record<string, unknown>>(data: T) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Plugr",
    url: "https://useplugr.app",
    logo: "https://useplugr.app/plugr.png",
    description: "A student-first discovery and connection platform for quick search, trusted profiles, and fast campus contact.",
    sameAs: ["https://x.com/useplugr", "https://www.instagram.com/useplugr"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@useplugr.app",
      contactType: "Customer Service",
    },
  };

  return JsonLd(schema);
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Plugr",
    url: "https://useplugr.app",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://useplugr.app/discover?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return JsonLd(schema);
}

export function BreadcrumbSchema(items: { name: string; url: string }[]) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return JsonLd(schema);
}

export function FAQSchema(items: { question: string; answer: string }[]) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return JsonLd(schema);
}

export function PersonSchema({
  name,
  description,
  url,
  image,
  jobTitle,
  sameAs,
}: {
  name: string;
  description: string;
  url: string;
  image?: string;
  jobTitle?: string;
  sameAs?: string[];
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    url,
    worksFor: {
      "@type": "Organization",
      name: "Plugr",
      url: "https://useplugr.app",
    },
  };
  if (image) schema.image = image;
  if (jobTitle) schema.jobTitle = jobTitle;
  if (sameAs?.length) schema.sameAs = sameAs;

  return JsonLd(schema);
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Plugr",
    description: "A student-first discovery and connection platform.",
    url: "https://useplugr.app",
    telephone: "+1-contact",
    email: "contact@useplugr.app",
    image: "https://useplugr.app/plugr.png",
    sameAs: ["https://x.com/useplugr"],
    priceRange: "Free",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Lagos",
      addressCountry: "NG",
    },
  };

  return JsonLd(schema);
}

export function WebPageSchema(title: string, description: string, url?: string) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: url ?? "https://useplugr.app",
    publisher: {
      "@type": "Organization",
      name: "Plugr",
      logo: "https://useplugr.app/plugr.png",
    },
  };

  return JsonLd(schema);
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  url,
  brand,
}: {
  name: string;
  description?: string;
  image?: string;
  price?: string;
  url: string;
  brand?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    brand: {
      "@type": "Brand",
      name: brand || "Plugr Stores",
    },
  };
  if (description) schema.description = description;
  if (image) schema.image = image;
  if (price) {
    schema.offers = {
      "@type": "Offer",
      price,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
    };
  }

  return JsonLd(schema);
}

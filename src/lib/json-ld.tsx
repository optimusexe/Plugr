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

export function WebPageSchema(title: string, description: string) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description: description,
    url: "https://useplugr.app",
    publisher: {
      "@type": "Organization",
      name: "Plugr",
      logo: "https://useplugr.app/plugr.png",
    },
  };

  return JsonLd(schema);
}

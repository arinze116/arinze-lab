// JSON-LD structured-data builders. Each returns a plain, developer-controlled
// object that gets serialised into a <script type="application/ld+json"> tag by
// the <JsonLd> component. No user input is involved — safe to JSON.stringify.
//
// See the JSON-LD Structured Data Guide: Organization/Person + WebSite on the
// home page, Article on writing/research, SoftwareApplication on projects,
// BreadcrumbList on inner pages, FAQPage where a real FAQ exists.

import { siteConfig, SITE_URL } from "./site";

const socialLinks = [
  siteConfig.socials.github,
  siteConfig.socials.linkedin,
  siteConfig.socials.x,
];

/** The site is a personal portfolio, so the entity is a Person, not an Organization. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: siteConfig.authorName,
    alternateName: siteConfig.name,
    url: SITE_URL,
    email: `mailto:${siteConfig.email}`,
    jobTitle: "Software Developer & Researcher",
    description: siteConfig.description,
    image: `${SITE_URL}/images/portrait.svg`,
    sameAs: socialLinks,
    address: {
      "@type": "PostalAddress",
      addressCountry: siteConfig.location,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.description,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#person` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Article for writing posts and research papers. */
export function articleSchema(input: {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  image?: string;
}) {
  const url = `${SITE_URL}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.datePublished,
    inLanguage: "en",
    image: input.image ? `${SITE_URL}${input.image}` : `${SITE_URL}/opengraph-image`,
    author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: siteConfig.authorName },
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

/** SoftwareApplication for project case studies. */
export function softwareApplicationSchema(input: {
  path: string;
  name: string;
  description: string;
  image?: string;
  applicationCategory?: string;
  operatingSystem?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    image: input.image ? `${SITE_URL}${input.image}` : undefined,
    applicationCategory: input.applicationCategory ?? "DeveloperApplication",
    operatingSystem: input.operatingSystem ?? "Any",
    author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: siteConfig.authorName },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/** BreadcrumbList for inner pages. Pass items in order (root → current). */
export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

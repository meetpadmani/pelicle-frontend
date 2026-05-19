import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'PELLICLE';
const DEFAULT_DESCRIPTION = "India's premium fashion destination — curating the finest in athleisure, ethnic and western wear for Men, Women & Kids.";
const DEFAULT_IMAGE = '/logo.png';
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * Dynamic SEO head component.
 *
 * @param {Object}  props
 * @param {string}  props.title        – Page title (will be appended with " — PELLICLE")
 * @param {string}  [props.description] – Meta description
 * @param {string}  [props.keywords]    – Comma-separated keywords
 * @param {string}  [props.image]       – OG / Twitter image URL
 * @param {string}  [props.url]         – Canonical URL path (e.g. "/products")
 * @param {string}  [props.type]        – OG type, default "website"
 * @param {boolean} [props.noIndex]     – If true, adds noindex robots tag
 * @param {Object}  [props.product]     – Product structured data (for PDP)
 * @param {string}  [props.product.name]
 * @param {string}  [props.product.description]
 * @param {string}  [props.product.image]
 * @param {number}  [props.product.price]
 * @param {string}  [props.product.currency]
 * @param {string}  [props.product.availability]  – "InStock" | "OutOfStock"
 * @param {string}  [props.product.brand]
 * @param {string}  [props.product.sku]
 * @param {number}  [props.product.rating]
 * @param {number}  [props.product.reviewCount]
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = 'pellicle, fashion, clothing, ethnic wear, western wear, online shopping, India',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  product,
}) => {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Wear Your Story`;
  const canonicalUrl = url ? `${BASE_URL}${url}` : undefined;
  const ogImage = image?.startsWith('http') ? image : `${BASE_URL}${image}`;

  // JSON-LD: WebSite (always present)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL || 'https://pellicle.com',
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // JSON-LD: Product (on product detail pages)
  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        brand: { '@type': 'Brand', name: product.brand || SITE_NAME },
        sku: product.sku || '',
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'INR',
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          seller: { '@type': 'Organization', name: SITE_NAME },
        },
        ...(product.rating && product.reviewCount
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
            }
          : {}),
      }
    : null;

  // JSON-LD: Organization
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL || 'https://pellicle.com',
    logo: `${BASE_URL}/logo.png`,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98765-43210',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  return (
    <Helmet>
      {/* ── Core ────────────────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph ──────────────────────────────────────────── */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter ─────────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── Structured Data ─────────────────────────────────────── */}
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      {productSchema && (
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      )}
    </Helmet>
  );
};

export default SEO;

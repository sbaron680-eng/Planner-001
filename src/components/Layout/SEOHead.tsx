import { Helmet } from 'react-helmet-async';
import { buildMeta, buildBreadcrumbJsonLD, SITE, type PageMeta } from '@/lib/seo';

interface Props extends PageMeta {
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  breadcrumbs?: { name: string; url: string }[];
}

export default function SEOHead({ jsonLd, breadcrumbs, ...pageMeta }: Props) {
  const breadcrumbJsonLd = breadcrumbs ? buildBreadcrumbJsonLD(breadcrumbs) : null;
  const allJsonLd = [
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
    ...(breadcrumbJsonLd ? [breadcrumbJsonLd] : []),
  ];
  const meta = buildMeta(pageMeta);

  return (
    <Helmet>
      <title>{meta.fullTitle}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      {meta.noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={meta.type} />
      <meta property="og:title" content={meta.fullTitle} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.fullTitle} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:site" content={SITE.twitter} />

      {/* Canonical */}
      <link rel="canonical" href={meta.url} />

      {/* JSON-LD 구조화 데이터 */}
      {allJsonLd.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(allJsonLd)}
        </script>
      )}
    </Helmet>
  );
}

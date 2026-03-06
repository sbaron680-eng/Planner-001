// ============================================================
// SEO 메타데이터 유틸리티
// ============================================================

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  path?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

const SITE = {
  name: 'Planner 001',
  url: 'https://planner-001.pages.dev',
  description: '아이패드·갤럭시 탭 최적화 PDF 플래너. 사주·별자리 운세 포함 맞춤 플래너 생성. 무료·유료 다양한 템플릿 제공.',
  image: '/og-image.png',
  twitter: '@planner001',
};

export function buildMeta(page: PageMeta): PageMeta & { fullTitle: string } {
  return {
    ...page,
    fullTitle: page.title === SITE.name ? SITE.name : `${page.title} | ${SITE.name}`,
    description: page.description || SITE.description,
    image: page.image || SITE.image,
    url: page.url ? `${SITE.url}${page.url}` : page.path ? `${SITE.url}${page.path}` : SITE.url,
    type: page.type || 'website',
  };
}

// JSON-LD 구조화 데이터
export function buildWebsiteJsonLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/planners?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildProductJsonLD(planner: {
  id: string; title: string; description: string;
  price: number; thumbnail?: string; slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: planner.title,
    description: planner.description,
    image: planner.thumbnail || SITE.image,
    url: `${SITE.url}/planners/${planner.slug}`,
    offers: {
      '@type': 'Offer',
      price: planner.price,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function buildFAQJsonLD(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function buildBreadcrumbJsonLD(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.url}`,
    })),
  };
}

export { SITE };

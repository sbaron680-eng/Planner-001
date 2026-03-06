/**
 * 블로그 / 가이드 콘텐츠 타입 정의
 *
 * 현재: JSON 기반 정적 데이터
 * 확장: MDX import 또는 CMS API 연동으로 교체 가능
 */

export type ContentType = 'blog' | 'guide';

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image' | 'callout' | 'code';
  /** paragraph / heading / callout / code: 텍스트 */
  text?: string;
  /** heading: h2 | h3 | h4 */
  level?: 2 | 3 | 4;
  /** list: 항목 배열 */
  items?: string[];
  /** image */
  src?: string;
  alt?: string;
  caption?: string;
  /** callout: info | warning | tip */
  calloutType?: 'info' | 'warning' | 'tip';
  /** code */
  lang?: string;
}

export interface PostMeta {
  slug: string;
  type: ContentType;
  title: string;
  description: string;
  /** ISO 날짜 문자열 e.g. "2025-12-01" */
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  author?: string;
  /** 읽기 소요 시간(분) */
  readingTime?: number;
}

export interface Post extends PostMeta {
  blocks: ContentBlock[];
}

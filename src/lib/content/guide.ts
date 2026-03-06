import type { Post } from './types';

/**
 * 가이드 포스트 목록
 */
export const guidePosts: Post[] = [
  {
    slug: 'getting-started',
    type: 'guide',
    title: '포춘탭 시작 가이드',
    description: '포춘탭 회원가입부터 첫 PDF 플래너 다운로드까지, 처음 사용자를 위한 단계별 안내입니다.',
    publishedAt: '2025-11-01',
    category: '시작하기',
    tags: ['시작하기', '가이드', '회원가입'],
    readingTime: 3,
    blocks: [
      { type: 'heading', level: 2, text: '1. 회원가입' },
      {
        type: 'paragraph',
        text: '우측 상단의 "무료 플래너 받기" 버튼을 클릭하고, 이메일 또는 소셜 계정(구글·카카오·네이버)으로 가입합니다.',
      },
      { type: 'heading', level: 2, text: '2. 플래너 선택' },
      {
        type: 'list',
        items: [
          '무료 플래너: 5종의 기본 플래너 즉시 다운로드 가능',
          '프리미엄 플래너: 사주 맞춤·커플·테마 플래너 제공',
        ],
      },
      { type: 'heading', level: 2, text: '3. PDF 다운로드' },
      {
        type: 'callout',
        calloutType: 'tip',
        text: '플래너 상세 페이지에서 "미리보기"로 레이아웃을 확인한 후 다운로드하세요.',
      },
    ],
  },
  {
    slug: 'premium-features',
    type: 'guide',
    title: '프리미엄 플래너 기능 가이드',
    description: '사주 맞춤 플래너, 커플 플래너, 운세 연동 등 프리미엄 전용 기능을 상세히 설명합니다.',
    publishedAt: '2025-11-10',
    category: '프리미엄',
    tags: ['프리미엄', '사주', '커플플래너'],
    readingTime: 5,
    blocks: [
      {
        type: 'paragraph',
        text: '프리미엄 플래너는 사주 정보를 입력하면 월별 운세와 함께 맞춤 레이아웃이 자동 생성됩니다.',
      },
      { type: 'heading', level: 2, text: '사주 맞춤 플래너' },
      {
        type: 'list',
        items: ['생년월일시 입력 → 사주 분석', '월별 운세 자동 삽입', '행운의 색상·방향 표시'],
      },
      { type: 'heading', level: 2, text: '커플 플래너' },
      {
        type: 'paragraph',
        text: '두 사람의 생년월일을 입력하면 궁합 분석과 함께 함께 계획할 수 있는 커플 전용 플래너가 생성됩니다.',
      },
    ],
  },
];

export function getGuidePost(slug: string): Post | undefined {
  return guidePosts.find((p) => p.slug === slug);
}

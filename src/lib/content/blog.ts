import type { Post } from './types';

/**
 * 블로그 포스트 목록
 *
 * 새 포스트 추가: 이 배열에 Post 객체를 추가하거나
 * 추후 CMS/MDX 파일에서 import하도록 교체합니다.
 */
export const blogPosts: Post[] = [
  {
    slug: 'how-to-use-ipad-planner',
    type: 'blog',
    title: '아이패드 플래너 200% 활용하는 법',
    description: 'PDF 플래너를 굿노트·노타빌리티에서 최적으로 사용하는 설정 방법과 실전 팁을 소개합니다.',
    publishedAt: '2025-12-01',
    category: '플래너 활용',
    tags: ['아이패드', 'PDF', '굿노트', '노타빌리티'],
    readingTime: 5,
    blocks: [
      {
        type: 'paragraph',
        text: '디지털 플래너는 아이패드와 굿노트·노타빌리티 조합으로 사용할 때 그 진가를 발휘합니다. 이 글에서는 PDF 플래너를 앱에 불러오는 방법부터 실전 필기 팁까지 단계별로 안내합니다.',
      },
      { type: 'heading', level: 2, text: '1단계: PDF 다운로드 및 앱 열기' },
      {
        type: 'list',
        items: [
          '포춘탭에서 원하는 플래너 PDF를 다운로드합니다.',
          '아이패드에서 파일 앱으로 이동 후 PDF를 찾습니다.',
          '공유 버튼 → 굿노트(또는 노타빌리티)로 열기를 선택합니다.',
        ],
      },
      { type: 'heading', level: 2, text: '2단계: 앱 내 설정 최적화' },
      {
        type: 'callout',
        calloutType: 'tip',
        text: '굿노트 기준, 문서 설정에서 "PDF 배경 유지"를 활성화하면 원본 레이아웃이 정확하게 표시됩니다.',
      },
      {
        type: 'paragraph',
        text: '펜 감도는 "중간" 으로 설정하고, 손바닥 거부 기능을 켜두면 필기가 훨씬 편안해집니다.',
      },
    ],
  },
  {
    slug: 'saju-planner-new-year',
    type: 'blog',
    title: '2026년 사주로 보는 새해 플래닝 전략',
    description: '사주 명리학 기반으로 2026년 운세를 해석하고, 연간 플래너에 반영하는 실전 방법을 안내합니다.',
    publishedAt: '2025-12-15',
    category: '운세·사주',
    tags: ['사주', '2026', '운세', '연간플래너'],
    readingTime: 7,
    blocks: [
      {
        type: 'paragraph',
        text: '2026년 병오년(丙午年)은 화(火)의 기운이 강한 해입니다. 이를 플래닝에 어떻게 반영할 수 있을까요?',
      },
      { type: 'heading', level: 2, text: '병오년의 핵심 키워드' },
      {
        type: 'list',
        items: ['열정과 추진력', '인간관계 확장', '빠른 변화와 적응', '창의적 도전'],
      },
      {
        type: 'callout',
        calloutType: 'info',
        text: '사주 플래너에서 월별 운세를 미리 확인하고, 좋은 운이 겹치는 달에 중요한 목표를 배치하면 효과적입니다.',
      },
    ],
  },
];

export function getBlogPost(slug: string): Post | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

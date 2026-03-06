import SEOHead from '@/components/Layout/SEOHead';
import Hero from '@/components/Home/Hero';
import Features from '@/components/Home/Features';
import PlannerShowcase from '@/components/Home/PlannerShowcase';
import HowItWorks from '@/components/Home/HowItWorks';
import { buildWebsiteJsonLD, buildFAQJsonLD } from '@/lib/seo';

const FAQ_ITEMS = [
  {
    question: 'PDF 플래너는 어떤 기기에서 사용할 수 있나요?',
    answer: '아이패드, 갤럭시 탭 등 모든 태블릿과 PC에서 사용 가능합니다. GoodNotes, Notability, PDF Expert 등 모든 PDF 앱과 호환됩니다.',
  },
  {
    question: '무료 플래너는 회원가입 없이 받을 수 있나요?',
    answer: '네, 무료 플래너 5종은 회원가입 없이 즉시 다운로드 가능합니다.',
  },
  {
    question: '사주·운세 플래너는 어떻게 만들어지나요?',
    answer: 'Claude AI가 생년월일을 분석하여 개인화된 사주 풀이와 월별 운세를 생성합니다. 이 내용이 PDF 플래너에 직접 포함됩니다.',
  },
  {
    question: 'PDF 내 하이퍼링크는 어떻게 작동하나요?',
    answer: '연간 달력에서 월별 페이지로, 월별 페이지에서 주간 계획으로 PDF 내부 링크로 바로 이동할 수 있습니다.',
  },
];

export default function HomePage() {
  const websiteJsonLD = buildWebsiteJsonLD();
  const faqJsonLD = buildFAQJsonLD(FAQ_ITEMS);

  return (
    <>
      <SEOHead
        title="아이패드·갤럭시 탭 사주·운세 PDF 플래너 | 포춘탭(FortuneTab)"
        description="AI 사주·별자리 운세가 포함된 맞춤 PDF 플래너. 아이패드·갤럭시 탭 최적화. 한국 공휴일 자동 표시, PDF 하이퍼링크 내비게이션. 무료 플래너 5종 제공."
        keywords="PDF 플래너, 아이패드 플래너, 갤럭시 탭 플래너, 사주 플래너, 운세 플래너, 굿노트 플래너, 2025 플래너"
        jsonLd={[websiteJsonLD, faqJsonLD]}
      />
      <Hero />
      <Features />
      <PlannerShowcase />
      <HowItWorks />
    </>
  );
}

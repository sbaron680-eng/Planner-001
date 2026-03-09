import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import { buildFAQJsonLD } from '@/lib/seo';

const FAQS = [
  {
    q: '포춘탭은 무료로 사용할 수 있나요?',
    a: '기본 5종의 플래너(미니멀·컬러풀·다크·자연·클래식)는 회원가입 없이 무료로 다운로드할 수 있습니다. 사주 맞춤 플래너, 별자리 플래너, 커플 플래너, 비즈니스 플래너 등 프리미엄 기능은 유료 플랜이 필요합니다.',
  },
  {
    q: 'PDF 플래너는 어떤 기기에서 사용할 수 있나요?',
    a: '아이패드(굿노트·노타빌리티·PDF Expert), 갤럭시 탭(삼성노트·FlexCil·Zoomable), PC(Adobe Acrobat·Foxit Reader) 등 PDF를 지원하는 모든 기기에서 사용 가능합니다.',
  },
  {
    q: '굿노트(GoodNotes)에 PDF 플래너를 가져오려면 어떻게 하나요?',
    a: '다운로드한 PDF 파일을 아이패드의 파일 앱에서 찾아 공유 버튼을 탭한 뒤 "GoodNotes로 열기"를 선택하세요. 또는 굿노트 앱 내에서 + 버튼 → PDF 가져오기를 통해 직접 불러올 수 있습니다. 플래너 내부의 하이퍼링크(연간→월간→주간 이동)는 굿노트 5 이상에서 완전히 지원됩니다.',
  },
  {
    q: '플래너는 연간·월간·주간 구성이 모두 포함되나요?',
    a: '네. 기본 플래너는 연간 캘린더, 월별 계획 페이지, 주간 계획 페이지로 구성되어 있습니다. 프리미엄 플래너(올인원·사주·비즈니스)는 여기에 일별 계획, 습관 트래커, 목표 관리 등 추가 섹션이 포함됩니다. PDF 내부 하이퍼링크로 각 페이지 간 빠르게 이동할 수 있습니다.',
  },
  {
    q: '소셜 로그인(구글/카카오/네이버) 시 개인정보는 안전한가요?',
    a: '소셜 로그인은 OAuth 2.0 표준을 사용하며, 비밀번호 정보를 포춘탭 서버에 저장하지 않습니다. 계정 연결에 필요한 최소한의 정보(이름·이메일·프로필 사진)만 수집하며, 수집된 정보는 개인정보처리방침에 따라 안전하게 보호됩니다.',
  },
  {
    q: '사주 플래너를 만들 때 어떤 정보를 입력해야 하나요?',
    a: '생년월일(양력 또는 음력 선택 가능)과 출생 시간을 입력하면 됩니다. 출생 시간을 모를 경우 "모름"을 선택할 수 있으며, 이 경우 시주를 제외한 사주 풀이가 제공됩니다. 커플 플래너는 두 사람의 생년월일을 각각 입력합니다.',
  },
  {
    q: '사주·운세 정보가 정확한가요?',
    a: '포춘탭의 사주 운세는 AI 기반 명리학 분석을 활용합니다. 오락적·참고적 목적으로 활용하시길 권장하며, 중요한 결정(의료·법률·투자 등)에는 전문가 상담을 권해 드립니다.',
  },
  {
    q: '무료 플래너와 프리미엄 플래너의 차이는 무엇인가요?',
    a: '무료 플래너는 회원가입 없이 즉시 다운로드 가능한 범용 디자인 5종입니다. 프리미엄 플래너는 AI 사주·별자리·커플 운세가 포함된 맞춤형 플래너로, 공휴일 자동 표시(대체공휴일 포함)·PDF 내부 하이퍼링크 내비게이션·더 많은 섹션(습관 트래커·가계부·독서 기록 등)이 제공됩니다.',
  },
  {
    q: 'PDF 파일 용량과 포맷은 어떻게 되나요?',
    a: 'A4 가로 방향(297×210mm) PDF로 제공됩니다. 파일 용량은 플래너 종류에 따라 약 5~20MB이며, 고해상도 인쇄(300dpi)와 태블릿 화면 표시에 모두 최적화되어 있습니다.',
  },
  {
    q: '결제 후 환불이 가능한가요?',
    a: '서비스 이용 약관에 따라, 플래너 PDF 다운로드 전에는 전액 환불이 가능합니다. 다운로드 이후에는 디지털 콘텐츠 특성상 환불이 제한됩니다. 자세한 사항은 문의하기를 이용해 주세요.',
  },
  {
    q: '플래너를 인쇄해서 사용할 수 있나요?',
    a: '네, A4 사이즈로 인쇄가 최적화되어 있습니다. PDF 인쇄 설정에서 "실제 크기" 또는 "맞춤 페이지"로 출력하시면 정확한 비율로 인쇄됩니다. 컬러 프린터를 사용하시면 플래너 본연의 디자인을 그대로 즐길 수 있습니다.',
  },
  {
    q: '플래너는 매년 업데이트되나요?',
    a: '네. 매년 연말에 다음 해 버전이 출시됩니다. 공휴일 정보는 정부 발표 기준으로 자동 반영되며, 대체공휴일도 포함됩니다. 기존 구매자는 같은 플래너의 신규 연도 버전을 할인된 가격으로 구매하실 수 있습니다.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown size={18} className={`flex-shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 border-t border-gray-100">
          <p className="text-gray-600 leading-relaxed text-sm">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const faqJsonLD = buildFAQJsonLD(FAQS.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <SEOHead
        title="자주 묻는 질문 | Planner 001"
        description="아이패드·갤럭시 탭 사주·운세 PDF 플래너 서비스 포춘탭에 대해 자주 묻는 질문 12가지를 모았습니다. 기기 호환성, 굿노트 사용법, 사주 입력 방법, 환불 정책 등을 확인하세요."
        keywords="아이패드 플래너 FAQ, 굿노트 PDF 플래너, 사주 플래너 사용법, 포춘탭 문의"
        path="/faq"
        jsonLd={[faqJsonLD]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">자주 묻는 질문</h1>
        <p className="text-gray-500 mb-10">궁금한 점을 찾지 못하셨나요? <a href="mailto:hello@fortunetab.com" className="text-indigo-600 hover:underline">문의하기</a>로 알려주세요.</p>

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </>
  );
}

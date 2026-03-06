import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';

const FAQS = [
  {
    q: '포춘탭은 무료로 사용할 수 있나요?',
    a: '기본 5종의 플래너는 회원가입 없이 무료로 다운로드할 수 있습니다. 사주 맞춤 플래너, 커플 플래너 등 프리미엄 기능은 유료 플랜이 필요합니다.',
  },
  {
    q: 'PDF 플래너는 어떤 기기에서 사용할 수 있나요?',
    a: '아이패드(굿노트, 노타빌리티), 갤럭시 탭(삼성노트, FlexCil), PC(Adobe Acrobat, PDF Expert) 등 PDF를 지원하는 모든 기기에서 사용 가능합니다.',
  },
  {
    q: '소셜 로그인(구글/카카오/네이버) 시 개인정보는 안전한가요?',
    a: '소셜 로그인은 OAuth 2.0 표준을 사용하며, 비밀번호 정보를 포춘탭 서버에 저장하지 않습니다. 계정 연결에 필요한 최소한의 정보(이름, 이메일, 프로필 사진)만 수집합니다.',
  },
  {
    q: '사주 정보가 정확한가요?',
    a: '포춘탭의 사주 운세는 AI 기반 명리학 분석을 활용합니다. 오락적 참고 목적으로 활용하시길 권장하며, 중요한 결정에는 전문가 상담을 권해 드립니다.',
  },
  {
    q: '결제 후 환불이 가능한가요?',
    a: '서비스 이용 약관에 따라, 플래너 PDF 다운로드 전에는 전액 환불이 가능합니다. 다운로드 이후에는 디지털 콘텐츠 특성상 환불이 제한됩니다. 자세한 사항은 문의하기를 이용해 주세요.',
  },
  {
    q: '플래너를 인쇄해서 사용할 수 있나요?',
    a: '네, A4 및 레터 사이즈로 인쇄가 최적화되어 있습니다. PDF 파일의 인쇄 설정에서 "실제 크기"로 출력하시면 정확한 비율로 인쇄됩니다.',
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
  return (
    <>
      <SEOHead
        title="자주 묻는 질문"
        description="포춘탭 서비스에 대해 자주 묻는 질문과 답변을 모았습니다."
        path="/faq"
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

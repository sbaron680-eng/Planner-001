import SEOHead from '@/components/Layout/SEOHead';

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="이용약관"
        description="포춘탭 서비스 이용약관입니다."
        path="/terms"
        noIndex
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">이용약관</h1>
        <p className="text-sm text-gray-400 mb-10">최종 업데이트: 2025년 12월 1일</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 포춘탭(이하 "회사")이 제공하는 PDF 플래너 및 운세 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 사이의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>"서비스"란 회사가 제공하는 PDF 플래너 다운로드, AI 운세·사주 분석 등 일체의 서비스를 의미합니다.</li>
              <li>"이용자"란 이 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
              <li>"유료 서비스"란 프리미엄 플래너 등 별도 결제가 필요한 서비스를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제3조 (서비스 이용)</h2>
            <p>
              이용자는 서비스를 개인적, 비상업적 목적으로만 이용할 수 있습니다. 서비스를 통해 제공되는 PDF 파일, 운세 결과 등의 콘텐츠를 무단으로 복제, 배포, 판매하는 행위는 금지됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제4조 (면책 조항)</h2>
            <p>
              사주·운세 서비스는 오락적 참고 목적으로 제공되며, 회사는 해당 내용의 정확성이나 결과에 대한 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">제5조 (문의)</h2>
            <p>
              서비스 이용과 관련한 문의는 <a href="mailto:hello@fortunetab.com" className="text-indigo-600 hover:underline">hello@fortunetab.com</a>으로 연락주시기 바랍니다.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

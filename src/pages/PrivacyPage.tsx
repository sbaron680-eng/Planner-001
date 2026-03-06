import SEOHead from '@/components/Layout/SEOHead';

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="개인정보처리방침"
        description="포춘탭 개인정보처리방침입니다."
        path="/privacy"
        noIndex
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-400 mb-10">최종 업데이트: 2025년 12월 1일</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. 수집하는 개인정보</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>이메일 회원가입: 이메일 주소, 이름, 암호화된 비밀번호</li>
              <li>소셜 로그인(구글·카카오·네이버): 소셜 계정의 이름, 이메일, 프로필 사진</li>
              <li>운세·사주 이용: 생년월일, 성별, 출생 시간(선택)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. 개인정보 이용 목적</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>회원 가입 및 서비스 제공</li>
              <li>맞춤형 플래너 및 운세 결과 생성</li>
              <li>서비스 관련 공지 및 안내</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. 개인정보 보관 기간</h2>
            <p>
              회원 탈퇴 시 지체 없이 파기하며, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안만 보관합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. 개인정보 제3자 제공</h2>
            <p>
              회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. 개인정보 처리 문의</h2>
            <p>
              개인정보 관련 문의는 <a href="mailto:privacy@fortunetab.com" className="text-indigo-600 hover:underline">privacy@fortunetab.com</a>으로 연락 주시기 바랍니다.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

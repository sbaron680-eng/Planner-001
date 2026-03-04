import { Link } from 'react-router-dom';
import { Download, Star, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-24 overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 텍스트 */}
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={14} />
              아이패드·갤럭시 탭 최적화 PDF 플래너
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
              나만의 특별한<br />
              <span className="text-indigo-600">사주·운세 플래너</span><br />
              를 만들어보세요
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              AI가 분석한 사주·별자리 운세와 함께, 아이패드와 갤럭시 탭에 최적화된 PDF 플래너를 생성해보세요.
              공휴일 자동 표시, PDF 내부 하이퍼링크 내비게이션까지 완벽하게 지원합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/planners/free"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Download size={18} />
                무료 플래너 다운로드
              </Link>
              <Link
                to="/planners/premium"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-3.5 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-colors"
              >
                <Star size={18} />
                프리미엄 플래너 보기
              </Link>
            </div>

            {/* 소셜 증명 */}
            <div className="flex items-center gap-6 mt-10">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">10+</p>
                <p className="text-sm text-gray-500">디자인 템플릿</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">무료</p>
                <p className="text-sm text-gray-500">5종 제공</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">A4</p>
                <p className="text-sm text-gray-500">태블릿 최적화</p>
              </div>
            </div>
          </div>

          {/* 이미지/미리보기 */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* 메인 카드 */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">2025 플래너</p>
                    <h3 className="text-lg font-bold text-gray-900">사주 플래너</h3>
                  </div>
                  <div className="bg-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full">
                    프리미엄
                  </div>
                </div>
                {/* 미리보기 달력 */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
                  {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                    <div key={d} className={`font-semibold py-1 ${d === '일' ? 'text-red-400' : d === '토' ? 'text-blue-400' : 'text-gray-500'}`}>{d}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const offset = 3; // 2025년 1월은 수요일 시작
                    const col = (day - 1 + offset) % 7;
                    return (
                      <div
                        key={day}
                        className={`py-1 rounded-lg text-xs ${
                          day === 15 ? 'bg-indigo-600 text-white font-bold' :
                          col === 0 ? 'text-red-400' :
                          col === 6 ? 'text-blue-400' :
                          'text-gray-700'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700">
                  ✨ AI 사주 분석 · 월별 운세 · 공휴일 자동 표시
                </div>
              </div>

              {/* 플로팅 카드들 */}
              <div className="absolute -top-4 -right-6 bg-amber-400 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg rotate-3">
                PDF 즉시 생성 ⚡
              </div>
              <div className="absolute -bottom-4 -left-6 bg-white rounded-xl shadow-lg p-3 text-xs border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm">⭐</div>
                  <div>
                    <p className="font-semibold text-gray-800">운세 포함</p>
                    <p className="text-gray-400">사주·별자리·커플</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

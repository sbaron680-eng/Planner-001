import { Link } from 'react-router-dom';
import { Download, Star, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

const STATS = [
  { value: '10+', label: '가지 디자인 템플릿' },
  { value: '무료', label: '플래너 5종 즉시 제공' },
  { value: 'A4', label: '기준 태블릿 최적화 레이아웃' },
];

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_#eef2ff_0%,_#fff_40%,_#fdf4ff_100%)] pt-16 pb-20 sm:pt-20 sm:pb-28">
      {/* 배경 장식 오브 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-48 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-violet-100 to-pink-100 opacity-50 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-[240px] w-[240px] rounded-full bg-amber-100 opacity-30 blur-2xl" />
        {/* 점 패턴 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">

          {/* ── 텍스트 영역 ── */}
          <div className="animate-fade-up">
            {/* 뱃지 */}
            <div className="inline-flex items-center gap-2 bg-white/80 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full mb-7 border border-indigo-100 shadow-sm backdrop-blur-sm">
              <Sparkles size={13} className="text-amber-500" />
              태블릿 전용 운세 플래너 · 포춘탭(FortuneTab)
              <span className="ml-1 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">NEW</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-6">
              운세와 계획을 한 번에,<br />
              <span className="text-gradient">아이패드·갤럭시 탭</span><br />
              플래너
            </h1>

            <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed max-w-xl">
              AI가 분석한 사주·별자리·커플 운세를 바탕으로, 아이패드·갤럭시 탭에 최적화된 한국어 디지털 플래너를 즉시 생성합니다.
              한국 공휴일 자동 표시와 하이퍼링크 내비게이션까지 한 번에 제공합니다.
            </p>

            {/* 특징 체크 리스트 */}
            <ul className="space-y-2 mb-8">
              {['사주·별자리·커플 운세 AI 분석', '공휴일 자동 표시 (대체공휴일 포함)', '연·월·주간 플래너 + 습관 트래커'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={15} className="text-indigo-500 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/planners/free"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-7 py-3.5 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
              >
                <Download size={17} />
                무료 플래너 다운로드
                <ArrowRight size={15} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link
                to="/planners/premium"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold px-7 py-3.5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm"
              >
                <Star size={17} />
                프리미엄 운세 플래너 보기
              </Link>
            </div>

            {/* 통계 */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-100">
              {STATS.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 플래너 미리보기 카드 ── */}
          <div className="relative flex justify-center lg:justify-end animate-fade-up animation-delay-200">
            <div className="relative w-full max-w-sm sm:max-w-md">

              {/* 메인 플래너 카드 */}
              <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/80 border border-gray-100 overflow-hidden">
                {/* 카드 헤더 */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-[10px] font-medium uppercase tracking-widest">2025 Planner</p>
                      <h3 className="text-white font-bold text-base mt-0.5">사주 플래너</h3>
                    </div>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      PREMIUM
                    </span>
                  </div>
                </div>

                {/* 미니 달력 */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">1월 JANUARY</p>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {DOW.map((d) => (
                      <div key={d} className={`text-[10px] font-bold py-1 ${
                        d === '일' ? 'text-red-400' : d === '토' ? 'text-blue-400' : 'text-gray-400'
                      }`}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const col = (day - 1 + 3) % 7; // 2025년 1월 수요일 시작
                      const isToday = day === 15;
                      return (
                        <div
                          key={day}
                          className={`text-[11px] py-1 rounded-lg font-medium transition-colors ${
                            isToday
                              ? 'bg-indigo-600 text-white font-bold shadow-sm'
                              : col === 0 ? 'text-red-400'
                              : col === 6 ? 'text-blue-400'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI 운세 배너 */}
                <div className="mx-5 mb-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-medium flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
                  AI 사주 분석 · 월별 운세 · 공휴일 자동 표시
                </div>
              </div>

              {/* 플로팅 뱃지 1 */}
              <div className="absolute -top-5 -right-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-200 rotate-3 animate-float">
                PDF 즉시 생성 ⚡
              </div>

              {/* 플로팅 카드 2 */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl shadow-gray-200 border border-gray-100 p-3.5 max-w-[160px] animate-float animation-delay-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-purple-200 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                    ⭐
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs">운세 포함</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">사주 · 별자리 · 커플</p>
                  </div>
                </div>
              </div>

              {/* 배경 데코 원 */}
              <div aria-hidden className="absolute -z-10 top-8 right-8 w-64 h-64 bg-indigo-100 rounded-full blur-2xl opacity-40" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { MousePointerClick, SlidersHorizontal, Zap, Smartphone, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: MousePointerClick,
    step: '01',
    title: '플래너 선택',
    description: '무료 또는 프리미엄 플래너 중 마음에 드는 디자인을 선택하세요.',
    gradient: 'from-indigo-500 to-blue-600',
    bar: 'bg-indigo-500',
  },
  {
    icon: SlidersHorizontal,
    step: '02',
    title: '옵션 설정',
    description: '연도를 선택하고, 프리미엄 플래너는 사주/운세 정보를 입력하세요.',
    gradient: 'from-violet-500 to-purple-600',
    bar: 'bg-violet-500',
  },
  {
    icon: Zap,
    step: '03',
    title: 'PDF 즉시 생성',
    description: 'AI가 운세를 분석하고 나만의 맞춤 PDF 플래너를 즉시 생성합니다.',
    gradient: 'from-fuchsia-500 to-pink-600',
    bar: 'bg-fuchsia-500',
  },
  {
    icon: Smartphone,
    step: '04',
    title: '다운로드 & 사용',
    description: '아이패드·갤럭시 탭에서 바로 사용하세요. GoodNotes 완벽 호환.',
    gradient: 'from-amber-500 to-orange-500',
    bar: 'bg-amber-500',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-gray-500 bg-white px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider ring-1 ring-gray-200">
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            이렇게 사용하세요
          </h2>
          <p className="text-lg text-gray-500">단 4단계로 나만의 플래너를 완성하세요</p>
        </div>

        {/* 스텝 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {STEPS.map((step, idx) => (
            <div key={step.step} className="relative group">
              {/* 커넥터 라인 (lg 이상) */}
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute top-9 left-1/2 w-full items-center z-0 pointer-events-none">
                  <div className="flex-1 h-px bg-gray-200 ml-4 mr-2" />
                  <ArrowRight size={12} className="text-gray-300 -ml-1" />
                </div>
              )}

              <div className="relative z-10 bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                {/* 스텝 번호 */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2">
                  <span className="text-[10px] font-black text-gray-300 tracking-widest">STEP</span>
                </div>

                {/* 아이콘 */}
                <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} items-center justify-center mb-4 shadow-md`}>
                  <step.icon size={22} className="text-white" />
                </div>

                {/* 번호 배지 */}
                <div className={`w-6 h-6 rounded-full ${step.bar} text-white text-[10px] font-black flex items-center justify-center mx-auto mb-3`}>
                  {idx + 1}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/planners/free"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-10 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 text-base hover:-translate-y-0.5"
          >
            지금 무료로 시작하기
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

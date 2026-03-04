import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    title: '플래너 선택',
    description: '무료 또는 프리미엄 플래너 중 마음에 드는 디자인을 선택하세요.',
    color: 'bg-indigo-600',
  },
  {
    step: '02',
    title: '옵션 설정',
    description: '연도를 선택하고, 프리미엄 플래너는 사주/운세 정보를 입력하세요.',
    color: 'bg-purple-600',
  },
  {
    step: '03',
    title: 'PDF 즉시 생성',
    description: 'AI가 운세를 분석하고 나만의 맞춤 PDF 플래너를 즉시 생성합니다.',
    color: 'bg-pink-600',
  },
  {
    step: '04',
    title: '다운로드 & 사용',
    description: '아이패드·갤럭시 탭에서 바로 사용하세요. GoodNotes 완벽 호환.',
    color: 'bg-amber-500',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            이렇게 사용하세요
          </h2>
          <p className="text-lg text-gray-500">
            단 4단계로 나만의 플래너를 완성하세요
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          {STEPS.map((step, idx) => (
            <div key={step.step} className="relative text-center">
              {idx < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-100" />
              )}
              <div className={`relative inline-flex w-12 h-12 rounded-full ${step.color} text-white font-bold text-lg items-center justify-center mb-4 z-10`}>
                {step.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/planners/free"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-10 py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-lg"
          >
            지금 무료로 시작하기 →
          </Link>
        </div>
      </div>
    </section>
  );
}

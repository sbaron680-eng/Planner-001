import { Tablet, Sparkles, Calendar, Link2, FileText, Sun } from 'lucide-react';

const FEATURES = [
  {
    icon: Tablet,
    title: '태블릿 최적화',
    description: '아이패드·갤럭시 탭에 최적화된 A4 PDF 레이아웃. GoodNotes, Notability 등 모든 앱 호환.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Sparkles,
    title: 'AI 사주·운세 분석',
    description: 'Claude AI가 분석한 나만의 사주 풀이, 별자리 운세, 커플 궁합을 플래너에 담아드립니다.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Calendar,
    title: '공휴일 자동 표시',
    description: '한국 공휴일·대체공휴일이 자동으로 표시됩니다. 매년 자동 업데이트.',
    color: 'bg-red-50 text-red-500',
  },
  {
    icon: Link2,
    title: 'PDF 하이퍼링크 내비게이션',
    description: '연간 → 월별 → 주간 → 일별 페이지를 PDF 내부 링크로 빠르게 이동.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: FileText,
    title: '다양한 부록 페이지',
    description: '습관 트래커, 목표 설정, 독서 기록, 가계부, 메모 페이지 등 풍부한 부록.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Sun,
    title: '자동 연도 업데이트',
    description: '매년 11월 1일에 다음 연도 플래너가 자동으로 준비됩니다.',
    color: 'bg-amber-50 text-amber-600',
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Planner 001만의 특별한 기능
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            단순한 플래너를 넘어, 나만의 운세와 계획이 담긴 특별한 한 해를 만들어보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                <feature.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

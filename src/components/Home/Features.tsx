import { Tablet, Sparkles, Calendar, Link2, FileText, Sun } from 'lucide-react';

const FEATURES = [
  {
    icon: Tablet,
    title: '태블릿 최적화',
    description: '아이패드·갤럭시 탭에 최적화된 A4 PDF 레이아웃. GoodNotes, Notability 등 모든 앱 호환.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
    num: '01',
  },
  {
    icon: Sparkles,
    title: 'AI 사주·운세 분석',
    description: 'Claude AI가 분석한 나만의 사주 풀이, 별자리 운세, 커플 궁합을 플래너에 담아드립니다.',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    ring: 'ring-violet-100',
    num: '02',
  },
  {
    icon: Calendar,
    title: '공휴일 자동 표시',
    description: '한국 공휴일·대체공휴일이 자동으로 표시됩니다. 매년 자동 업데이트.',
    gradient: 'from-red-500 to-rose-500',
    bg: 'bg-red-50',
    ring: 'ring-red-100',
    num: '03',
  },
  {
    icon: Link2,
    title: 'PDF 하이퍼링크 내비게이션',
    description: '연간 → 월별 → 주간 → 일별 페이지를 PDF 내부 링크로 빠르게 이동.',
    gradient: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-100',
    num: '04',
  },
  {
    icon: FileText,
    title: '다양한 부록 페이지',
    description: '습관 트래커, 목표 설정, 독서 기록, 가계부, 메모 페이지 등 풍부한 부록.',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
    num: '05',
  },
  {
    icon: Sun,
    title: '자동 연도 업데이트',
    description: '매년 11월 1일에 다음 연도 플래너가 자동으로 준비됩니다.',
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
    num: '06',
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider ring-1 ring-indigo-100">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Planner 001만의 특별한 기능
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            단순한 플래너를 넘어, 나만의 운세와 계획이 담긴 특별한 한 해를 만들어보세요.
          </p>
        </div>

        {/* 피처 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative p-6 rounded-2xl border border-gray-100 ring-1 ring-transparent hover:ring-2 hover:${f.ring} bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              {/* 배경 번호 */}
              <span className="absolute -right-2 -top-3 text-7xl font-black text-gray-50 select-none group-hover:text-gray-100 transition-colors">
                {f.num}
              </span>

              {/* 아이콘 */}
              <div className={`relative inline-flex w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} items-center justify-center mb-5 shadow-md`}>
                <f.icon size={20} className="text-white" />
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

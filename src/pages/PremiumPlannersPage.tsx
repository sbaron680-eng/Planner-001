import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/Layout/SEOHead';
import PlannerCard from '@/components/Planners/PlannerCard';
import PlannerFilter from '@/components/Planners/PlannerFilter';
import { PREMIUM_PLANNERS } from '@/data/planners';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'premium', label: '프리미엄' },
  { value: 'saju', label: '사주' },
  { value: 'astrology', label: '별자리' },
  { value: 'couple', label: '커플' },
  { value: 'business', label: '비즈니스' },
];

export default function PremiumPlannersPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') ?? 'all';
  const [filter, setFilter] = useState(initialCategory);

  const filtered = filter === 'all'
    ? PREMIUM_PLANNERS
    : PREMIUM_PLANNERS.filter((p) => p.category === filter);

  return (
    <>
      <SEOHead
        title="프리미엄 PDF 플래너 | 사주·운세 포함 맞춤 플래너 | 포춘탭"
        description="AI 사주·별자리·커플 운세 포함 프리미엄 맞춤 PDF 플래너. 아이패드·갤럭시 탭 최적화. PDF 하이퍼링크 내비게이션."
        keywords="프리미엄 PDF 플래너, 사주 플래너, 별자리 플래너, 커플 플래너, 비즈니스 플래너"
        breadcrumbs={[{ name: '홈', url: '/' }, { name: '프리미엄 플래너', url: '/planners/premium' }]}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">프리미엄</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">프리미엄 운세·사주 플래너</h1>
            <p className="text-gray-500 text-lg">AI 맞춤 운세·사주 분석 포함. 총 {PREMIUM_PLANNERS.length}종</p>
          </div>

          <div className="mb-8">
            <PlannerFilter options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">해당 카테고리의 플래너가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((planner) => (
                <PlannerCard key={planner.id} planner={planner} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

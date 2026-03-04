import { useState } from 'react';
import SEOHead from '@/components/Layout/SEOHead';
import PlannerCard from '@/components/Planners/PlannerCard';
import PlannerFilter from '@/components/Planners/PlannerFilter';
import { FREE_PLANNERS } from '@/data/planners';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'minimal', label: '미니멀' },
  { value: 'colorful', label: '컬러풀' },
  { value: 'dark', label: '다크' },
  { value: 'nature', label: '자연' },
  { value: 'classic', label: '클래식' },
];

export default function FreePlannersPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? FREE_PLANNERS
    : FREE_PLANNERS.filter((p) => p.category === filter);

  return (
    <>
      <SEOHead
        title="무료 PDF 플래너 다운로드 | Planner 001"
        description="회원가입 없이 무료로 다운로드 가능한 아이패드·갤럭시 탭 PDF 플래너 5종. 미니멀, 컬러풀, 다크, 자연, 클래식 테마."
        keywords="무료 PDF 플래너, 아이패드 무료 플래너, 태블릿 플래너 무료 다운로드"
        breadcrumbs={[{ name: '홈', url: '/' }, { name: '무료 플래너', url: '/planners/free' }]}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">무료</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">무료 PDF 플래너</h1>
            <p className="text-gray-500 text-lg">회원가입 없이 즉시 다운로드 가능. 총 {FREE_PLANNERS.length}종</p>
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

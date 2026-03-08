import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FREE_PLANNERS, PREMIUM_PLANNERS } from '@/data/planners';
import PlannerCard from '@/components/Planners/PlannerCard';

export default function PlannerShowcase() {
  const freeSample = FREE_PLANNERS.slice(0, 3);
  const premiumSample = PREMIUM_PLANNERS.slice(0, 3);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 무료 플래너 */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">무료</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">무료 태블릿 플래너</h2>
              <p className="text-gray-500 mt-1">회원가입 없이 바로 다운로드 가능</p>
            </div>
            <Link
              to="/planners/free"
              className="hidden sm:inline-flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              전체 보기 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeSample.map((planner) => (
              <PlannerCard key={planner.id} planner={planner} />
            ))}
          </div>
          <div className="sm:hidden mt-4">
            <Link
              to="/planners/free"
              className="inline-flex items-center gap-1 text-indigo-600 font-medium"
            >
              무료 플래너 전체 보기 <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 유료 플래너 */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">프리미엄</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">프리미엄 운세·사주 플래너</h2>
              <p className="text-gray-500 mt-1">운세·사주 분석 포함, AI 맞춤 PDF 생성</p>
            </div>
            <Link
              to="/planners/premium"
              className="hidden sm:inline-flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              전체 보기 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumSample.map((planner) => (
              <PlannerCard key={planner.id} planner={planner} />
            ))}
          </div>
          <div className="sm:hidden mt-4">
            <Link
              to="/planners/premium"
              className="inline-flex items-center gap-1 text-indigo-600 font-medium"
            >
              프리미엄 플래너 전체 보기 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

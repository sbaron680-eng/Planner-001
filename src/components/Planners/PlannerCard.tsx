import { Link } from 'react-router-dom';
import { Download, Star, BookOpen } from 'lucide-react';
import type { Planner } from '@/types';

interface Props {
  planner: Planner;
}

export default function PlannerCard({ planner }: Props) {
  const isFree = planner.type === 'free';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col">
      {/* 썸네일 */}
      <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 h-44 flex items-center justify-center">
        {planner.thumbnail ? (
          <img
            src={planner.thumbnail}
            alt={planner.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <BookOpen size={48} className="text-indigo-200" />
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isFree
              ? 'bg-green-100 text-green-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}>
            {isFree ? '무료' : '프리미엄'}
          </span>
          {planner.is_fortune && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              운세 포함
            </span>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-1">{planner.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-3 flex-1">{planner.description}</p>

        {/* 기능 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {planner.features.slice(0, 3).map((f) => (
            <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{f}</span>
          ))}
          {planner.features.length > 3 && (
            <span className="text-xs text-gray-400">+{planner.features.length - 3}개</span>
          )}
        </div>

        {/* 하단 */}
        <div className="flex items-center justify-between">
          <div>
            {isFree ? (
              <span className="text-lg font-bold text-green-600">무료</span>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {planner.price.toLocaleString()}원
              </span>
            )}
            <p className="text-xs text-gray-400">{planner.pages_count}페이지</p>
          </div>
          <Link
            to={`/planners/${planner.slug}`}
            className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
              isFree
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isFree ? <Download size={15} /> : <Star size={15} />}
            {isFree ? '무료 다운로드' : '자세히 보기'}
          </Link>
        </div>
      </div>
    </div>
  );
}

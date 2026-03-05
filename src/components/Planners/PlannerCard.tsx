import { Link } from 'react-router-dom';
import { Download, Star, BookOpen, ArrowRight } from 'lucide-react';
import type { Planner } from '@/types';

interface Props {
  planner: Planner;
}

// 템플릿별 썸네일 그라디언트 (thumbnail 이미지 없을 때 사용)
const TEMPLATE_GRADIENT: Record<string, { from: string; to: string; dark?: boolean }> = {
  minimal:     { from: '#f8f8fa', to: '#e8e8f0' },
  colorful:    { from: '#fde8e8', to: '#ede8fd' },
  dark:        { from: '#0e1019', to: '#1a1e2e', dark: true },
  nature:      { from: '#e8f5e0', to: '#d0ecc0' },
  classic:     { from: '#fdf3dc', to: '#eedcb0' },
  premium_all: { from: '#e0eafd', to: '#ccd8f8' },
  saju:        { from: '#fdeaea', to: '#f5d8c8' },
  astrology:   { from: '#0a061c', to: '#1e0a40', dark: true },
  couple:      { from: '#ffe4ef', to: '#ffd0e4' },
  business:    { from: '#e0eaf5', to: '#c8d8ec' },
};

// 템플릿별 액센트 컬러
const TEMPLATE_ACCENT: Record<string, string> = {
  minimal:     '#6366f1',
  colorful:    '#f87171',
  dark:        '#60a5fa',
  nature:      '#2f7349',
  classic:     '#654220',
  premium_all: '#1638a8',
  saju:        '#a8161a',
  astrology:   '#8a2be2',
  couple:      '#d63c6e',
  business:    '#0e2e60',
};

// 템플릿별 미리보기 아이콘 텍스트
const TEMPLATE_ICON: Record<string, string> = {
  minimal:     '◻',
  colorful:    '🌈',
  dark:        '🌙',
  nature:      '🌿',
  classic:     '📜',
  premium_all: '💎',
  saju:        '🔮',
  astrology:   '⭐',
  couple:      '💕',
  business:    '📊',
};

export default function PlannerCard({ planner }: Props) {
  const isFree = planner.type === 'free';
  const tg = TEMPLATE_GRADIENT[planner.template_key] ?? TEMPLATE_GRADIENT.minimal;
  const accent = TEMPLATE_ACCENT[planner.template_key] ?? '#6366f1';
  const icon   = TEMPLATE_ICON[planner.template_key] ?? '📋';

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">

      {/* ── 썸네일 ── */}
      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${tg.from} 0%, ${tg.to} 100%)` }}
      >
        {planner.thumbnail ? (
          <img
            src={planner.thumbnail}
            alt={planner.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          /* 템플릿 미리보기 (이미지 없을 때) */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 select-none">
            {/* 미니 달력 그래픽 */}
            <div
              className="rounded-xl shadow-lg overflow-hidden w-36"
              style={{ background: tg.dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)', border: `1px solid ${tg.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}` }}
            >
              <div className="h-5 flex items-center justify-center text-[9px] font-bold text-white" style={{ background: accent }}>
                2025 플래너
              </div>
              <div className="p-2 grid grid-cols-7 gap-0.5">
                {['일','월','화','수','목','금','토'].map((d) => (
                  <div key={d} className={`text-center text-[7px] font-semibold ${d === '일' ? 'text-red-400' : d === '토' ? 'text-blue-400' : tg.dark ? 'text-gray-400' : 'text-gray-400'}`}>{d}</div>
                ))}
                {Array.from({ length: 28 }, (_, i) => i + 1).map((n) => (
                  <div key={n} className={`text-center text-[7px] rounded ${n === 15 ? 'text-white font-bold' : tg.dark ? 'text-gray-300' : 'text-gray-600'}`} style={n === 15 ? { background: accent } : undefined}>{n}</div>
                ))}
              </div>
            </div>
            <span className="text-2xl">{icon}</span>
          </div>
        )}

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-semibold flex items-center gap-1">
            자세히 보기 <ArrowRight size={12} />
          </span>
        </div>

        {/* 배지들 */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            isFree ? 'badge-free' : 'badge-premium'
          }`}>
            {isFree ? '무료' : '프리미엄'}
          </span>
          {planner.is_fortune && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full badge-fortune">
              운세
            </span>
          )}
        </div>
      </div>

      {/* ── 카드 본문 ── */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">{planner.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-3 flex-1">{planner.description}</p>

        {/* 기능 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {planner.features.slice(0, 3).map((f) => (
            <span key={f} className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md border border-gray-100">{f}</span>
          ))}
          {planner.features.length > 3 && (
            <span className="text-[11px] text-gray-400 px-1">+{planner.features.length - 3}개</span>
          )}
        </div>

        {/* 가격 + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            {isFree ? (
              <span className="text-lg font-extrabold text-emerald-600">무료</span>
            ) : (
              <span className="text-lg font-extrabold text-gray-900">
                {planner.price.toLocaleString()}원
              </span>
            )}
            <p className="text-[11px] text-gray-400 mt-0.5">{planner.pages_count}페이지 · A4</p>
          </div>
          <Link
            to={`/planners/${planner.slug}`}
            className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm ${
              isFree
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 hover:shadow-emerald-300'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200 hover:shadow-indigo-300'
            }`}
          >
            {isFree ? <Download size={14} /> : <Star size={14} />}
            {isFree ? '다운로드' : '보기'}
          </Link>
        </div>
      </div>
    </div>
  );
}

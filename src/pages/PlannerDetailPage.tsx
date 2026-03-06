import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Sparkles, Shield, Download } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import PDFGenerator from '@/components/PDF/PDFGenerator';
import SajuForm from '@/components/Fortune/SajuForm';
import AstrologyForm from '@/components/Fortune/AstrologyForm';
import FortuneDisplay from '@/components/Fortune/FortuneDisplay';
import { getPlannerBySlug } from '@/data/planners';
import { useAuthStore } from '@/store/useAuthStore';
import type { FortuneResult } from '@/types';

// 템플릿별 헤더 그라디언트
const TEMPLATE_HDR: Record<string, string> = {
  minimal:     'from-gray-700 via-gray-900 to-gray-800',
  colorful:    'from-pink-500 via-rose-500 to-orange-400',
  dark:        'from-slate-900 via-blue-950 to-indigo-950',
  nature:      'from-green-700 via-emerald-800 to-teal-700',
  classic:     'from-amber-800 via-orange-900 to-yellow-800',
  premium_all: 'from-blue-800 via-indigo-800 to-blue-900',
  saju:        'from-red-800 via-rose-900 to-orange-800',
  astrology:   'from-purple-950 via-indigo-900 to-violet-950',
  couple:      'from-rose-600 via-pink-600 to-fuchsia-600',
  business:    'from-slate-800 via-blue-900 to-slate-900',
};

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

const TEMPLATE_ICON: Record<string, string> = {
  minimal: '◻', colorful: '🌈', dark: '🌙', nature: '🌿',
  classic: '📜', premium_all: '💎', saju: '🔮', astrology: '⭐',
  couple: '💕', business: '📊',
};

export default function PlannerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const [fortuneResult, setFortuneResult] = useState<FortuneResult | null>(null);

  const planner = getPlannerBySlug(slug ?? '');
  if (!planner) return <Navigate to="/404" replace />;

  const needsFortune = planner.is_fortune;
  const isSaju = planner.category === 'saju' || planner.category === 'couple';
  const isAstrology = planner.category === 'astrology';
  const canDownload = planner.type === 'free' || !!user;

  const hdr     = TEMPLATE_HDR[planner.template_key]    ?? TEMPLATE_HDR.minimal;
  const accent  = TEMPLATE_ACCENT[planner.template_key] ?? '#6366f1';
  const icon    = TEMPLATE_ICON[planner.template_key]   ?? '📋';

  return (
    <>
      <SEOHead
        title={`${planner.title} | 포춘탭`}
        description={planner.description}
        keywords={`${planner.title}, PDF 플래너, 아이패드 플래너`}
        breadcrumbs={[
          { name: '홈', url: '/' },
          { name: planner.type === 'free' ? '무료 플래너' : '프리미엄 플래너', url: `/planners/${planner.type}` },
          { name: planner.title, url: `/planners/${planner.slug}` },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 뒤로 가기 */}
          <Link
            to={`/planners/${planner.type}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors"
          >
            <ArrowLeft size={15} />
            {planner.type === 'free' ? '무료 플래너' : '프리미엄 플래너'}로 돌아가기
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* ── 템플릿 프리뷰 패널 ── */}
            <div className={`relative bg-gradient-to-br ${hdr} rounded-3xl overflow-hidden min-h-80 lg:min-h-full flex flex-col items-center justify-center p-8 shadow-2xl`}>
              {/* 배경 패턴 */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {planner.thumbnail ? (
                <img
                  src={planner.thumbnail}
                  alt={planner.title}
                  className="relative z-10 rounded-2xl object-contain max-h-80 shadow-2xl"
                />
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-5">
                  {/* 미니 플래너 목업 */}
                  <div className="w-52 bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                    <div className="h-8 flex items-center justify-center text-[10px] font-bold text-white/90 tracking-widest" style={{ background: accent + 'dd' }}>
                      2025 PLANNER
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {['일','월','화','수','목','금','토'].map((d) => (
                          <div key={d} className="text-center text-[7px] font-bold text-white/50">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((n) => (
                          <div key={n} className={`text-center text-[7px] rounded py-0.5 ${n === 15 ? 'text-white font-bold' : 'text-white/60'}`} style={n === 15 ? { background: accent } : undefined}>
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-3 pb-3">
                      <div className="h-1.5 rounded-full bg-white/20 mb-1.5" />
                      <div className="h-1.5 rounded-full bg-white/15 w-4/5 mb-1.5" />
                      <div className="h-1.5 rounded-full bg-white/10 w-3/5" />
                    </div>
                  </div>
                  <div className="text-5xl">{icon}</div>
                  <p className="text-white/60 text-sm font-medium">{planner.title}</p>
                </div>
              )}

              {/* 하단 배지 */}
              <div className="relative z-10 mt-6 flex gap-2 flex-wrap justify-center">
                <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  {planner.pages_count}페이지
                </span>
                <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  A4 · 가로
                </span>
                {planner.is_fortune && (
                  <span className="bg-amber-400/30 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border border-amber-300/20">
                    AI 운세 포함
                  </span>
                )}
              </div>
            </div>

            {/* ── 상세 정보 패널 ── */}
            <div className="space-y-6">
              {/* 타입 배지 + 제목 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    planner.type === 'free' ? 'badge-free' : 'badge-premium'
                  }`}>
                    {planner.type === 'free' ? '무료' : '프리미엄'}
                  </span>
                  {planner.is_fortune && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full badge-fortune flex items-center gap-1">
                      <Sparkles size={10} /> 운세 포함
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{planner.title}</h1>
                <p className="text-gray-500 mt-2 leading-relaxed text-sm">{planner.description}</p>
              </div>

              {/* 가격 */}
              <div className="flex items-baseline gap-3 pb-5 border-b border-gray-100">
                {planner.type === 'free' ? (
                  <span className="text-3xl font-extrabold text-emerald-600">무료</span>
                ) : (
                  <span className="text-3xl font-extrabold text-gray-900">
                    {planner.price.toLocaleString()}원
                  </span>
                )}
                <span className="text-sm text-gray-400">{planner.pages_count}페이지 · A4 가로</span>
              </div>

              {/* 포함 기능 */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">포함된 기능</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {planner.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* 운세 폼 */}
              {needsFortune && canDownload && !fortuneResult && (
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-600" />
                    {isSaju ? '사주 정보 입력' : isAstrology ? '별자리 운세 입력' : '운세 정보 입력'}
                  </h3>
                  {isSaju && <SajuForm onResult={setFortuneResult} />}
                  {isAstrology && <AstrologyForm onResult={setFortuneResult} />}
                </div>
              )}

              {/* 운세 결과 */}
              {fortuneResult && (
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-lg">🎉</span> 운세 분석 완료
                    </h3>
                    <button onClick={() => setFortuneResult(null)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      다시 입력
                    </button>
                  </div>
                  <FortuneDisplay result={fortuneResult} />
                </div>
              )}

              {/* PDF 생성 / CTA */}
              {canDownload ? (
                (!needsFortune || fortuneResult) && (
                  <PDFGenerator planner={planner} fortuneData={fortuneResult ?? undefined} userName={user?.name} />
                )
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                    <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">프리미엄 플래너는 로그인 후 이용하실 수 있습니다.</p>
                  </div>
                  <Link to="/login"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200">
                    <Download size={16} /> 로그인 후 구매하기
                  </Link>
                  <p className="text-xs text-center text-gray-400">
                    계정이 없으신가요?{' '}
                    <Link to="/register" className="text-indigo-500 hover:text-indigo-700 font-medium">회원가입</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

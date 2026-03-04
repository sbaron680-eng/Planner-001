import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, BookOpen, ArrowLeft } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import PDFGenerator from '@/components/PDF/PDFGenerator';
import SajuForm from '@/components/Fortune/SajuForm';
import AstrologyForm from '@/components/Fortune/AstrologyForm';
import FortuneDisplay from '@/components/Fortune/FortuneDisplay';
import { getPlannerBySlug } from '@/data/planners';
import { useAuthStore } from '@/store/useAuthStore';
import type { FortuneResult } from '@/types';

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

  return (
    <>
      <SEOHead
        title={`${planner.title} | Planner 001`}
        description={planner.description}
        keywords={`${planner.title}, PDF 플래너, 아이패드 플래너`}
        breadcrumbs={[
          { name: '홈', url: '/' },
          { name: planner.type === 'free' ? '무료 플래너' : '프리미엄 플래너', url: `/planners/${planner.type}` },
          { name: planner.title, url: `/planners/${planner.slug}` },
        ]}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 뒤로 가기 */}
          <Link
            to={`/planners/${planner.type}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8"
          >
            <ArrowLeft size={16} />
            {planner.type === 'free' ? '무료 플래너' : '프리미엄 플래너'}로 돌아가기
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* 썸네일 / 미리보기 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl flex items-center justify-center min-h-72 lg:min-h-full">
              {planner.thumbnail ? (
                <img
                  src={planner.thumbnail}
                  alt={planner.title}
                  className="rounded-2xl object-contain max-h-96 shadow-xl"
                />
              ) : (
                <BookOpen size={80} className="text-indigo-200" />
              )}
            </div>

            {/* 상세 정보 */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    planner.type === 'free' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {planner.type === 'free' ? '무료' : '프리미엄'}
                  </span>
                  {planner.is_fortune && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">운세 포함</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{planner.title}</h1>
                <p className="text-gray-500 mt-2 leading-relaxed">{planner.description}</p>
              </div>

              {/* 가격 */}
              <div className="flex items-baseline gap-3">
                {planner.type === 'free' ? (
                  <span className="text-3xl font-bold text-green-600">무료</span>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {planner.price.toLocaleString()}원
                  </span>
                )}
                <span className="text-sm text-gray-400">{planner.pages_count}페이지 · A4</span>
              </div>

              {/* 기능 목록 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">포함된 기능</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {planner.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* 운세 폼 (프리미엄 + is_fortune) */}
              {needsFortune && canDownload && !fortuneResult && (
                <div className="bg-purple-50 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    {isSaju ? '🔮 사주 정보 입력' : isAstrology ? '⭐ 별자리 운세 입력' : '✨ 운세 정보 입력'}
                  </h3>
                  {isSaju && <SajuForm onResult={setFortuneResult} />}
                  {isAstrology && <AstrologyForm onResult={setFortuneResult} />}
                </div>
              )}

              {/* 운세 결과 표시 */}
              {fortuneResult && (
                <div className="bg-white rounded-2xl border border-indigo-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">🎉 운세 분석 완료</h3>
                    <button
                      onClick={() => setFortuneResult(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      다시 입력
                    </button>
                  </div>
                  <FortuneDisplay result={fortuneResult} />
                </div>
              )}

              {/* PDF 생성 / CTA */}
              {canDownload ? (
                (!needsFortune || fortuneResult) && (
                  <PDFGenerator
                    planner={planner}
                    fortuneData={fortuneResult ?? undefined}
                    userName={user?.name}
                  />
                )
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full text-center bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    로그인 후 구매하기
                  </Link>
                  <p className="text-xs text-center text-gray-400">
                    또는 <Link to="/register" className="text-indigo-500 hover:text-indigo-700">회원가입</Link>하고 시작하세요
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

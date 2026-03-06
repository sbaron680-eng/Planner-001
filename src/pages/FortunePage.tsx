import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, UserPlus } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import FortuneIntro from '@/components/Fortune/FortuneIntro';
import FortuneTabs, { getTab, TABS } from '@/components/Fortune/FortuneTabs';
import type { TabId } from '@/components/Fortune/FortuneTabs';
import PlannerCTA from '@/components/Fortune/PlannerCTA';
import SajuForm from '@/components/Fortune/SajuForm';
import AstrologyForm from '@/components/Fortune/AstrologyForm';
import CoupleForm from '@/components/Fortune/CoupleForm';
import DailyFortuneForm from '@/components/Fortune/DailyFortuneForm';
import FortuneDisplay from '@/components/Fortune/FortuneDisplay';
import { useAuthStore } from '@/store/useAuthStore';
import type { FortuneResult } from '@/types';

export default function FortunePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') ?? 'saju';
  const activeTabId = (TABS.some(t => t.id === rawTab) ? rawTab : 'saju') as TabId;
  const [result, setResult] = useState<FortuneResult | null>(null);
  const { user } = useAuthStore();

  const activeTab = getTab(activeTabId);

  const handleTabChange = (tabId: TabId) => {
    setSearchParams({ tab: tabId });
    setResult(null);
  };

  const handleResult = (r: FortuneResult) => {
    setResult(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead
        title="무료 사주·별자리·커플 운세 | 포춘탭(FortuneTab)"
        description="AI가 분석하는 무료 사주 풀이, 별자리 운세, 커플 궁합. 오늘의 운세도 확인하고 플래너에 바로 적용하세요."
        keywords="무료 사주, 별자리 운세, 커플 궁합, 오늘의 운세, AI 사주 분석, 포춘탭"
        breadcrumbs={[{ name: '홈', url: '/' }, { name: '운세·사주', url: '/fortune' }]}
      />

      {/* 인트로 — H1, 서브텍스트, 안내문구, 상단 CTA */}
      <FortuneIntro activeTab={activeTab} />

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* 탭 바 */}
          <FortuneTabs activeTab={activeTabId} onTabChange={handleTabChange} />

          {/* 결과 or 폼 영역 */}
          {result ? (
            <div className="space-y-5">
              {/* 결과 헤더 */}
              <div className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${activeTab.bgLight} border ${activeTab.border}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeTab.emoji}</span>
                  <h2 className={`text-base font-bold ${activeTab.text}`}>운세 결과</h2>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className={`text-xs font-semibold ${activeTab.text} hover:opacity-70 transition-opacity`}
                >
                  다시 입력
                </button>
              </div>

              {/* 결과 본문 */}
              <FortuneDisplay result={result} />

              {/* 결과 하단 — 탭별 플래너 CTA */}
              <PlannerCTA type={activeTabId} />

              {/* 비로그인 시 회원가입 유도 */}
              {!user && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <UserPlus size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 mb-2">
                      결과를 저장하고, 내 운세 기반 플래너 추천을 계속 받고 싶다면 회원가입하세요.
                    </p>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      무료 회원가입
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 폼 영역 */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${activeTab.gradient}`} />
              <div className="p-6">
                {activeTabId === 'saju'      && <SajuForm onResult={handleResult} />}
                {activeTabId === 'astrology' && <AstrologyForm onResult={handleResult} />}
                {activeTabId === 'couple'    && <CoupleForm onResult={handleResult} />}
                {activeTabId === 'daily'     && <DailyFortuneForm onResult={handleResult} />}
              </div>
            </div>
          )}

          {/* 페이지 하단 — 무료 플래너 다운로드 영역 */}
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center">
            <div className="text-2xl mb-2">🎁</div>
            <h3 className="text-base font-bold text-gray-900 mb-1">5종 무료 플래너 즉시 다운로드</h3>
            <p className="text-sm text-gray-600 mb-4">
              운세와 함께 사용하는 무료 플래너로 오늘부터 계획을 시작해보세요.
            </p>
            <Link
              to="/planners/free"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
            >
              <Download size={16} />
              무료 플래너 받기
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

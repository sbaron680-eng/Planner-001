/**
 * ContentLayout — 블로그 / 가이드 페이지용 레이아웃
 *
 * 특징:
 * - 사이드바 광고 슬롯 (데스크탑 기준 우측 300px)
 * - 본문 상단 광고 슬롯
 * - 모바일: 단일 컬럼, 사이드바 광고 숨김
 * - SEO 정보성 콘텐츠에 최적화된 max-width 설정
 */

import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdSlot from './AdSlot';

// 실 배포 시 환경변수 또는 상수로 관리
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT ?? '';
const AD_SLOTS = {
  top: import.meta.env.VITE_AD_SLOT_TOP ?? '',
  sidebar: import.meta.env.VITE_AD_SLOT_SIDEBAR ?? '',
  inArticle: import.meta.env.VITE_AD_SLOT_IN_ARTICLE ?? '',
};

export default function ContentLayout() {
  return (
    <>
      <ScrollRestoration />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {/* 상단 광고 (leaderboard) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <AdSlot variant="top" slot={AD_SLOTS.top} client={ADSENSE_CLIENT} />
          </div>

          {/* 본문 + 사이드바 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8 items-start">
              {/* 콘텐츠 영역 */}
              <div className="min-w-0 flex-1">
                <Outlet />
              </div>

              {/* 사이드바 (데스크탑 전용) */}
              <aside className="hidden lg:block w-[300px] flex-shrink-0 space-y-6 sticky top-24">
                <AdSlot variant="sidebar" slot={AD_SLOTS.sidebar} client={ADSENSE_CLIENT} />
                <AdSlot variant="sidebar" slot={AD_SLOTS.sidebar} client={ADSENSE_CLIENT} />
              </aside>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

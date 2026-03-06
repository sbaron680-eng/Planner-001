/**
 * ProductLayout — 플래너 / 운세 페이지용 레이아웃
 *
 * 특징:
 * - 광고 슬롯 없음 (전환율 최우선)
 * - Navbar + 콘텐츠 + Footer 단순 구조
 * - 기존 App.tsx와 동일한 뼈대; 라우터에서 선택적으로 사용
 */

import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ProductLayout() {
  return (
    <>
      <ScrollRestoration />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

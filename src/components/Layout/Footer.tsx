import { Link } from 'react-router-dom';
import { Sparkles, Mail, Instagram, ArrowRight } from 'lucide-react';

const LINKS = {
  planner: [
    { label: '무료 플래너', to: '/planners/free' },
    { label: '프리미엄 플래너', to: '/planners/premium' },
    { label: '사주 플래너', to: '/planners/premium?category=saju' },
    { label: '커플 플래너', to: '/planners/premium?category=couple' },
  ],
  fortune: [
    { label: '사주 풀이', to: '/fortune?tab=saju' },
    { label: '별자리 운세', to: '/fortune?tab=astrology' },
    { label: '커플 궁합', to: '/fortune?tab=couple' },
    { label: '오늘의 운세', to: '/fortune?tab=daily' },
  ],
  content: [
    { label: '블로그', to: '/blog' },
    { label: '이용 가이드', to: '/guide' },
    { label: '자주 묻는 질문', to: '/faq' },
    { label: '문의하기', to: '/contact' },
  ],
  support: [
    { label: '개인정보처리방침', to: '/privacy', href: '' },
    { label: '이용약관', to: '/terms', href: '' },
    { label: '문의 이메일', to: '', href: 'mailto:hello@fortunetab.com' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-400">

      {/* ── CTA 배너 ── */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-pink-600/10 rounded-2xl border border-white/10 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-bold text-xl mb-1">지금 바로 시작하세요</h3>
              <p className="text-gray-400 text-sm">5종의 무료 플래너를 즉시 다운로드할 수 있습니다.</p>
            </div>
            <Link
              to="/planners/free"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5 whitespace-nowrap"
            >
              무료 플래너 보기
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* 브랜드 */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles size={15} className="text-white" />
              </div>
              <span className="font-bold text-white text-base">
                Fortune<span className="text-indigo-400">Tab</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              포춘탭 — 사주·운세 기반<br />
              맞춤 PDF 플래너 서비스
            </p>
            <div className="flex gap-3 mt-5">
              <a href="mailto:hello@fortunetab.com"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Mail size={15} />
              </a>
              <a href="https://instagram.com/fortunetab" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Instagram size={15} />
              </a>
            </div>
          </div>

          {/* 플래너 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">플래너</h4>
            <ul className="space-y-2.5 text-sm">
              {LINKS.planner.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-gray-500 hover:text-gray-200 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 운세 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">운세·사주</h4>
            <ul className="space-y-2.5 text-sm">
              {LINKS.fortune.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-gray-500 hover:text-gray-200 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 콘텐츠 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">콘텐츠</h4>
            <ul className="space-y-2.5 text-sm">
              {LINKS.content.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-gray-500 hover:text-gray-200 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">고객지원</h4>
            <ul className="space-y-2.5 text-sm">
              {LINKS.support.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className="text-gray-500 hover:text-gray-200 transition-colors">{l.label}</Link>
                  ) : (
                    <a href={l.href} className="text-gray-500 hover:text-gray-200 transition-colors">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {year} FortuneTab (포춘탭). All rights reserved.</p>
          <p>Powered by Cloudflare Pages · Claude AI</p>
        </div>
      </div>
    </footer>
  );
}

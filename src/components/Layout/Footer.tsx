import { Link } from 'react-router-dom';
import { BookOpen, Mail, Instagram } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* 브랜드 */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <BookOpen size={20} />
              Planner 001
            </Link>
            <p className="text-sm leading-relaxed">
              아이패드·갤럭시 탭 최적화<br />
              사주·별자리 운세 포함 맞춤 PDF 플래너
            </p>
            <div className="flex gap-3 mt-4">
              <a href="mailto:hello@planner001.com" className="hover:text-white transition-colors">
                <Mail size={18} />
              </a>
              <a href="https://instagram.com/planner001" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* 플래너 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">플래너</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/planners/free" className="hover:text-white transition-colors">무료 플래너</Link></li>
              <li><Link to="/planners/premium" className="hover:text-white transition-colors">유료 플래너</Link></li>
              <li><Link to="/planners/premium?category=saju" className="hover:text-white transition-colors">사주 플래너</Link></li>
              <li><Link to="/planners/premium?category=couple" className="hover:text-white transition-colors">커플 플래너</Link></li>
            </ul>
          </div>

          {/* 운세 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">운세·사주</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/fortune?tab=saju" className="hover:text-white transition-colors">사주 풀이</Link></li>
              <li><Link to="/fortune?tab=astrology" className="hover:text-white transition-colors">별자리 운세</Link></li>
              <li><Link to="/fortune?tab=couple" className="hover:text-white transition-colors">커플 궁합</Link></li>
              <li><Link to="/fortune?tab=daily" className="hover:text-white transition-colors">오늘의 운세</Link></li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              <li><a href="mailto:hello@planner001.com" className="hover:text-white transition-colors">문의하기</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {year} Planner 001. All rights reserved.</p>
          <p className="text-gray-600">Powered by Cloudflare Pages · Claude AI</p>
        </div>
      </div>
    </footer>
  );
}

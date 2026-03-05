import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogIn, User, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-medium transition-colors px-1 py-0.5 ${
      isActive
        ? 'text-indigo-600 after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-indigo-500'
        : 'text-gray-600 hover:text-indigo-600'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-indigo-300 transition-shadow">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">
              Planner <span className="text-indigo-600">001</span>
            </span>
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/planners/free" className={linkClass}>무료 플래너</NavLink>
            <NavLink to="/planners/premium" className={linkClass}>프리미엄</NavLink>
            <NavLink to="/fortune" className={linkClass}>
              <span className="flex items-center gap-1">
                <Sparkles size={13} className="text-amber-500" />
                운세·사주
              </span>
            </NavLink>
          </nav>

          {/* 우측 액션 */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm">{user.name}</span>
                  <ChevronDown size={13} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropOpen && (
                  <div
                    className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fade-in"
                    onMouseLeave={() => setDropOpen(false)}
                  >
                    <Link to="/dashboard" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-lg mx-1">
                      <User size={14} /> 대시보드
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors rounded-lg mx-1">
                        <Settings size={14} /> 관리자
                      </Link>
                    )}
                    <div className="my-1.5 h-px bg-gray-100 mx-2" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors rounded-lg mx-1">
                      <LogOut size={14} /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                  <LogIn size={15} /> 로그인
                </Link>
                <Link to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300">
                  무료 시작
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-5 space-y-1 animate-fade-up">
          <NavLink to="/planners/free" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors" onClick={() => setMenuOpen(false)}>무료 플래너</NavLink>
          <NavLink to="/planners/premium" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors" onClick={() => setMenuOpen(false)}>프리미엄</NavLink>
          <NavLink to="/fortune" className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors" onClick={() => setMenuOpen(false)}>
            <Sparkles size={14} className="text-amber-500" /> 운세·사주
          </NavLink>
          <div className="pt-2 pb-1 h-px bg-gray-100 mx-1" />
          {user ? (
            <>
              <Link to="/dashboard" className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>대시보드</Link>
              <button onClick={handleLogout} className="block px-3 py-2.5 w-full text-left rounded-xl text-sm text-red-600 hover:bg-red-50">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>로그인</Link>
              <Link to="/register" className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 text-center" onClick={() => setMenuOpen(false)}>무료 시작</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LogIn, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2 font-bold text-indigo-700 text-lg">
            <BookOpen size={22} />
            Planner 001
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/planners/free" className={navClass}>무료 플래너</NavLink>
            <NavLink to="/planners/premium" className={navClass}>유료 플래너</NavLink>
            <NavLink to="/fortune" className={navClass}>운세·사주</NavLink>
          </nav>

          {/* 우측 액션 */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {user.name[0]}
                  </div>
                  {user.name}
                  <ChevronDown size={14} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                    onMouseLeave={() => setDropOpen(false)}>
                    <Link to="/dashboard" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User size={14} /> 대시보드
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings size={14} /> 관리자
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut size={14} /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600">
                  <LogIn size={16} /> 로그인
                </Link>
                <Link to="/register"
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  무료 시작
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <NavLink to="/planners/free" className={navClass} onClick={() => setMenuOpen(false)}>무료 플래너</NavLink>
          <NavLink to="/planners/premium" className={navClass} onClick={() => setMenuOpen(false)}>유료 플래너</NavLink>
          <NavLink to="/fortune" className={navClass} onClick={() => setMenuOpen(false)}>운세·사주</NavLink>
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm text-gray-700" onClick={() => setMenuOpen(false)}>대시보드</Link>
              <button onClick={handleLogout} className="block text-sm text-red-600">로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm text-gray-700" onClick={() => setMenuOpen(false)}>로그인</Link>
              <Link to="/register" className="block text-sm font-medium text-indigo-600" onClick={() => setMenuOpen(false)}>무료 시작</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

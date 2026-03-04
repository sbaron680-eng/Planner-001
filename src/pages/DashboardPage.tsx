import { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen, Download, Star, Settings } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
  const { user, isLoading, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <SEOHead title="대시보드 | Planner 001" description="나의 플래너 대시보드" />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {user.name}님 👋</h1>
              <p className="text-gray-500 mt-1">
                {user.plan === 'premium' ? '프리미엄 회원' : '무료 회원'} · {user.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user.plan === 'free' && (
                <Link
                  to="/planners/premium"
                  className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Star size={15} />
                  업그레이드
                </Link>
              )}
            </div>
          </div>

          {/* 퀵 액션 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <Link
              to="/planners/free"
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="bg-green-50 w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <Download size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">무료 플래너</h3>
              <p className="text-sm text-gray-400 mt-0.5">즉시 다운로드</p>
            </Link>

            <Link
              to="/planners/premium"
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="bg-indigo-50 w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                <BookOpen size={20} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900">프리미엄 플래너</h3>
              <p className="text-sm text-gray-400 mt-0.5">맞춤 PDF 생성</p>
            </Link>

            <Link
              to="/fortune"
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="bg-purple-50 w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <Star size={20} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">운세·사주</h3>
              <p className="text-sm text-gray-400 mt-0.5">오늘의 운세 확인</p>
            </Link>
          </div>

          {/* 계정 정보 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Settings size={18} className="text-gray-400" />
              <h2 className="font-semibold text-gray-900">계정 정보</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">이름</p>
                <p className="font-medium text-gray-800">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">이메일</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">플랜</p>
                <p className="font-medium text-gray-800">
                  {user.plan === 'premium' ? '프리미엄' : '무료'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">가입일</p>
                <p className="font-medium text-gray-800">
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

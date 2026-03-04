import { Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import LoginForm from '@/components/Auth/LoginForm';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <SEOHead
        title="로그인 | Planner 001"
        description="Planner 001에 로그인하고 나만의 플래너를 관리하세요."
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xl mb-2">
              <BookOpen size={24} />
              Planner 001
            </div>
            <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
            <p className="text-gray-500 mt-1 text-sm">계정에 로그인하세요</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}

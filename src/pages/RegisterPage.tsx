import { Navigate } from 'react-router-dom';
import { BookOpen, Sparkles } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import RegisterForm from '@/components/Auth/RegisterForm';
import { useAuthStore } from '@/store/useAuthStore';

export default function RegisterPage() {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <>
      <SEOHead
        title="회원가입 | Planner 001"
        description="Planner 001에 가입하고 AI 사주·운세 맞춤 PDF 플래너를 만들어보세요."
      />
      <div className="min-h-screen flex">
        {/* 좌측 브랜드 패널 (md 이상) */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BookOpen size={24} />
            Planner 001
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-sm">
              <Sparkles size={14} />
              무료로 시작하기
            </div>
            <h2 className="text-3xl font-bold leading-snug">
              지금 가입하고<br />첫 플래너를 받아보세요
            </h2>
            <ul className="space-y-2 text-indigo-200 text-sm">
              <li>✓ 무료 플래너 즉시 다운로드</li>
              <li>✓ AI 사주 기반 맞춤 운세</li>
              <li>✓ 월간·주간·일간 플래너 지원</li>
            </ul>
          </div>
          <p className="text-indigo-300 text-xs">© 2026 Planner 001</p>
        </div>

        {/* 우측 폼 영역 */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gray-50">
          <div className="w-full max-w-md">
            {/* 모바일 로고 */}
            <div className="md:hidden flex items-center justify-center gap-2 text-indigo-600 font-bold text-xl mb-8">
              <BookOpen size={22} />
              Planner 001
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">새 계정 만들기</h1>
              <p className="text-gray-500 mt-1 text-sm">가입 후 바로 플래너를 받으세요</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

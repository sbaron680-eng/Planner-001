/**
 * OAuth 콜백 페이지: /auth/oauth
 *
 * 백엔드가 소셜 로그인 완료 후 아래 형식으로 리다이렉트합니다.
 *   /auth/oauth#token=<JWT>&next=/dashboard
 *   /auth/oauth#error=<message>
 *
 * URL fragment(#)는 서버로 전송되지 않으므로 토큰이 서버 로그에 남지 않습니다.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1); // '#' 제거
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    const errorMsg = params.get('error');
    const next = params.get('next') ?? '/dashboard';

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      return;
    }

    if (!token) {
      setError('인증 정보를 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    loginWithToken(decodeURIComponent(token)).then(() => {
      navigate(next, { replace: true });
    });
  }, [loginWithToken, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-red-600 font-semibold text-lg">로그인 실패</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 size={36} className="animate-spin text-indigo-600 mx-auto" />
        <p className="text-gray-500 text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}

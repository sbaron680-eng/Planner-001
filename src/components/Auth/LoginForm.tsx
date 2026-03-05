import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import OAuthButtons from './OAuthButtons';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const errMsg = await login(form.email, form.password);
    setLoading(false);
    if (errMsg) {
      setError(errMsg);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-5">
      {/* 소셜 로그인 */}
      <OAuthButtons redirectAfter="/dashboard" />

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">또는 이메일로 로그인</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 이메일/비밀번호 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="hello@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">비밀번호</label>
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="비밀번호 입력"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" />로그인 중...</> : '로그인'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-800">
          회원가입
        </Link>
      </p>
    </div>
  );
}

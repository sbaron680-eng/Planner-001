import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import OAuthButtons from './OAuthButtons';

function PasswordStrength({ password }: { password: string }) {
  const rules = [
    { label: '8자 이상', ok: password.length >= 8 },
    { label: '영문 포함', ok: /[a-zA-Z]/.test(password) },
    { label: '숫자 포함', ok: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-1.5">
      {rules.map((r) => (
        <span
          key={r.label}
          className={`inline-flex items-center gap-1 text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}
        >
          <Check size={11} strokeWidth={r.ok ? 3 : 1.5} />
          {r.label}
        </span>
      ))}
    </div>
  );
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showPwC, setShowPwC] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', name: '' });

  const pwMatch = form.passwordConfirm && form.password !== form.passwordConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError(null);
    const errMsg = await register({ email: form.email, password: form.password, name: form.name });
    setLoading(false);
    if (errMsg) {
      setError(errMsg);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-5">
      {/* 소셜 회원가입 */}
      <OAuthButtons redirectAfter="/dashboard" />

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">또는 이메일로 가입</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="홍길동"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="8자 이상"
              minLength={8}
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
          <PasswordStrength password={form.password} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 확인</label>
          <div className="relative">
            <input
              type={showPwC ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.passwordConfirm}
              onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
              placeholder="비밀번호 재입력"
              className={`w-full border rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
                pwMatch ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPwC((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showPwC ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPwC ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwMatch && (
            <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !!pwMatch}
          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" />가입 중...</> : '회원가입'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-800">
          로그인
        </Link>
      </p>
    </div>
  );
}

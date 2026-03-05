/**
 * 소셜 로그인 버튼 모음 (Google, Kakao, Naver)
 * 각 버튼 클릭 시 /api/auth/oauth/<provider>?next=<redirectAfter> 로 이동
 */
interface Props {
  redirectAfter?: string;
}

const PROVIDERS = [
  {
    key: 'google',
    label: 'Google로 계속하기',
    bg: 'bg-white hover:bg-gray-50',
    border: 'border border-gray-200',
    text: 'text-gray-700',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    key: 'kakao',
    label: '카카오로 계속하기',
    bg: 'bg-[#FEE500] hover:bg-[#F0DA00]',
    border: '',
    text: 'text-[#3C1E1E]',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#3C1E1E" aria-hidden="true">
        <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.716 1.633 5.1 4.125 6.559L5.05 21l4.56-2.99C10.349 18.33 11.163 18.6 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z" />
      </svg>
    ),
  },
  {
    key: 'naver',
    label: '네이버로 계속하기',
    bg: 'bg-[#03C75A] hover:bg-[#02B050]',
    border: '',
    text: 'text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white" aria-hidden="true">
        <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
      </svg>
    ),
  },
];

export default function OAuthButtons({ redirectAfter = '/dashboard' }: Props) {
  const handleClick = (provider: string) => {
    window.location.href = `/api/auth/oauth/${provider}?next=${encodeURIComponent(redirectAfter)}`;
  };

  return (
    <div className="space-y-2.5">
      {PROVIDERS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => handleClick(p.key)}
          className={`w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${p.bg} ${p.border} ${p.text}`}
        >
          {p.icon}
          {p.label}
        </button>
      ))}
    </div>
  );
}

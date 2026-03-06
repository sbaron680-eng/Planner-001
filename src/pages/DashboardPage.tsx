import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { BookOpen, Download, Star, Settings, Clock, Shield, ChevronRight } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { fortuneHistoryApi } from '@/lib/api';
import type { FortuneHistoryItem } from '@/types';

const TYPE_LABEL: Record<string, string> = {
  saju: '🔮 사주 풀이', astrology: '⭐ 별자리 운세',
  couple: '💕 커플 궁합', daily: '☀️ 오늘의 운세', yearly: '📅 연간 운세',
};

const TYPE_COLOR: Record<string, string> = {
  saju: 'bg-violet-100 text-violet-700', astrology: 'bg-indigo-100 text-indigo-700',
  couple: 'bg-rose-100 text-rose-700', daily: 'bg-amber-100 text-amber-700', yearly: 'bg-green-100 text-green-700',
};

export default function DashboardPage() {
  const { user, isLoading, fetchMe } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();
  const [history, setHistory] = useState<FortuneHistoryItem[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => { fetchMe(); }, [fetchMe]);
  useEffect(() => {
    if (user) {
      fetchProfile();
      setHistLoading(true);
      fortuneHistoryApi.list(undefined, 1).then(r => {
        if (r.ok && r.data) setHistory(r.data.slice(0, 5));
      }).finally(() => setHistLoading(false));
    }
  }, [user, fetchProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const hasProfile = !!(profile?.saju_data?.birth_date || profile?.birth_date);

  return (
    <>
      <SEOHead title="대시보드 | 포춘탭" description="나의 플래너 대시보드" />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">안녕하세요, {user.name}님 👋</h1>
              <p className="text-gray-500 mt-0.5 text-sm">
                {user.plan === 'premium' ? '프리미엄 회원' : '무료 회원'} · {user.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/profile"
                className="inline-flex items-center gap-1.5 text-sm bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl hover:border-indigo-300 transition-colors">
                <Settings size={15} />프로파일
              </Link>
              {user.plan === 'free' && (
                <Link to="/planners/premium"
                  className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                  <Star size={15} />업그레이드
                </Link>
              )}
            </div>
          </div>

          {/* 프로파일 미완성 배너 */}
          {!hasProfile && (
            <Link to="/profile"
              className="flex items-center gap-3 p-4 mb-6 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl hover:border-indigo-200 transition-colors">
              <div className="bg-indigo-100 p-2 rounded-xl flex-shrink-0">
                <Shield size={18} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-indigo-800">사주·별자리 프로파일 설정하기</p>
                <p className="text-xs text-indigo-600">생년월일을 저장하면 운세 분석 시 자동 입력됩니다. 개인정보는 AES-256 암호화로 보호됩니다.</p>
              </div>
              <ChevronRight size={16} className="text-indigo-400" />
            </Link>
          )}

          {/* 퀵 액션 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { to: '/planners/free', icon: Download, bg: 'bg-green-50 group-hover:bg-green-100', ico: 'text-green-600', title: '무료 플래너', desc: '즉시 다운로드' },
              { to: '/planners/premium', icon: BookOpen, bg: 'bg-indigo-50 group-hover:bg-indigo-100', ico: 'text-indigo-600', title: '프리미엄 플래너', desc: '맞춤 PDF 생성' },
              { to: '/fortune', icon: Star, bg: 'bg-purple-50 group-hover:bg-purple-100', ico: 'text-purple-600', title: '운세·사주', desc: '오늘의 운세 확인' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className={`${item.bg} w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors`}>
                  <item.icon size={20} className={item.ico} />
                </div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 운세 기록 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <h2 className="font-semibold text-gray-900">최근 운세 기록</h2>
                </div>
                <Link to="/fortune" className="text-xs text-indigo-600 font-medium hover:text-indigo-800">
                  운세 보기 →
                </Link>
              </div>
              {histLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">🔮</p>
                  <p className="text-sm">아직 운세 기록이 없습니다.</p>
                  <Link to="/fortune" className="mt-3 inline-block text-xs text-indigo-600 font-medium hover:underline">
                    첫 운세 받기 →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {history.map(h => (
                    <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${TYPE_COLOR[h.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {TYPE_LABEL[h.type] ?? h.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">{h.summary ?? '운세 결과'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {h.year}년 · {new Date(h.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 계정 정보 + 보안 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={16} className="text-gray-400" />
                <h2 className="font-semibold text-gray-900">계정 정보</h2>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: '이름', value: user.name },
                  { label: '이메일', value: user.email },
                  { label: '플랜', value: user.plan === 'premium' ? '프리미엄' : '무료' },
                  { label: '가입일', value: new Date(user.created_at).toLocaleDateString('ko-KR') },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400 text-xs">{item.label}</span>
                    <span className="font-medium text-gray-800 text-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-green-700">
                  <Shield size={12} />
                  <span className="font-medium">보안 강화 적용됨</span>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] text-gray-500">
                  <li>· PBKDF2-HMAC-SHA256 비밀번호 해싱</li>
                  <li>· AES-256-GCM 개인정보 암호화</li>
                  <li>· HMAC-SHA256 JWT 서명 검증</li>
                  <li>· IP 기반 레이트 리밋</li>
                </ul>
                <Link to="/profile"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
                  프로파일 및 보안 설정 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

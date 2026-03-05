import { Navigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import ProfileForm from '@/components/Profile/ProfileForm';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProfilePage() {
  const { user, isLoading } = useAuthStore();

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
      <SEOHead title="내 프로파일 | Planner 001" description="사주·별자리·PDF 개인 설정" />

      {/* 헤더 */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{user.name}님의 프로파일</h1>
              <p className="text-white/70 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* 보안 배지 */}
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-6">
            <Shield size={14} className="flex-shrink-0" />
            <span>개인정보(생년월일, 시주, 파트너 정보)는 <strong>AES-256-GCM</strong>으로 암호화하여 저장합니다. 서버에서도 복호화 키 없이는 읽을 수 없습니다.</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
            <div className="p-6">
              <ProfileForm />
            </div>
          </div>

          {/* 보안 설명 */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" /> 개인정보 보호 정책
            </h3>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>• <strong>비밀번호</strong>: PBKDF2-HMAC-SHA256 (10만 반복, 랜덤 솔트)로 해싱 저장</li>
              <li>• <strong>개인 운세 정보</strong>: AES-256-GCM으로 암호화, 복호화 키는 서버 환경변수에만 존재</li>
              <li>• <strong>운세 기록</strong>: 입력 데이터·결과 모두 암호화 저장, 비로그인 시 비식별 보관</li>
              <li>• <strong>레이트 리밋</strong>: IP당 로그인 10회/분, 운세 분석 15회/분으로 무차별 공격 차단</li>
              <li>• <strong>HTTPS</strong>: 모든 전송 구간 TLS 1.3 암호화</li>
              <li>• <strong>JWT</strong>: HMAC-SHA256 서명 검증으로 위조 방지</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

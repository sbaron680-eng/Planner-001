import { useState } from 'react';
import { Download, Loader2, AlertCircle, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generatePDF } from '@/lib/pdf/generator';
import { usePlannerStore } from '@/store/usePlannerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import type { Planner, FortuneResult } from '@/types';

interface Props {
  planner: Planner;
  fortuneData?: FortuneResult;
  userName?: string;
}

export default function PDFGenerator({ planner, fortuneData, userName }: Props) {
  const { plannerYear } = usePlannerStore();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이름: props → 프로파일 사주 이름 → 계정 이름 순으로 fallback
  const resolvedName = userName
    ?? profile?.saju_data?.name
    ?? user?.name
    ?? '';

  // 선호 템플릿이 있으면 프로파일 것, 없으면 플래너 기본 템플릿
  const resolvedTemplate = profile?.preferred_template
    ? profile.preferred_template
    : planner.template_key;

  // 선호 연도가 있으면 그것, 없으면 plannerYear
  const resolvedYear = profile?.preferred_year ?? plannerYear;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const pdfBytes = await generatePDF({
        planner_id: planner.id,
        year: resolvedYear,
        fortune: fortuneData,
        user_name: resolvedName,
        template_key: resolvedTemplate,
      });

      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${planner.title}_${resolvedYear}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 프로파일 정보 표시 */}
      {user && (resolvedName || profile?.preferred_template) && (
        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
          <UserCircle size={13} className="flex-shrink-0" />
          <span>
            {resolvedName && <><strong>{resolvedName}</strong>님의 플래너 · </>}
            {profile?.preferred_template && `${profile.preferred_template} 템플릿 · `}
            {resolvedYear}년
          </span>
          <Link to="/profile" className="ml-auto text-indigo-500 hover:underline font-medium">설정</Link>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" />PDF 생성 중...</>
        ) : (
          <><Download size={18} />{resolvedYear}년 PDF 다운로드</>
        )}
      </button>
      <p className="text-xs text-center text-gray-400">
        {planner.pages_count}페이지 · A4 · 아이패드/갤럭시 탭 최적화
      </p>
    </div>
  );
}

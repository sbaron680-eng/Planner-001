import { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { generatePDF } from '@/lib/pdf/generator';
import { usePlannerStore } from '@/store/usePlannerStore';
import type { Planner, FortuneResult } from '@/types';

interface Props {
  planner: Planner;
  fortuneData?: FortuneResult;
  userName?: string;
}

export default function PDFGenerator({ planner, fortuneData, userName }: Props) {
  const { plannerYear } = usePlannerStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const pdfBytes = await generatePDF({
        planner_id: planner.id,
        year: plannerYear,
        fortune: fortuneData,
        user_name: userName,
        template_key: planner.template_key,
      });

      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${planner.title}_${plannerYear}.pdf`;
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
          <>
            <Loader2 size={18} className="animate-spin" />
            PDF 생성 중...
          </>
        ) : (
          <>
            <Download size={18} />
            {plannerYear}년 PDF 다운로드
          </>
        )}
      </button>
      <p className="text-xs text-center text-gray-400">
        {planner.pages_count}페이지 · A4 · 아이패드/갤럭시 탭 최적화
      </p>
    </div>
  );
}

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/Layout/SEOHead';
import SajuForm from '@/components/Fortune/SajuForm';
import AstrologyForm from '@/components/Fortune/AstrologyForm';
import FortuneDisplay from '@/components/Fortune/FortuneDisplay';
import type { FortuneResult } from '@/types';

const TABS = [
  { id: 'saju', label: '🔮 사주 풀이' },
  { id: 'astrology', label: '⭐ 별자리 운세' },
  { id: 'couple', label: '💕 커플 궁합' },
  { id: 'daily', label: '☀️ 오늘의 운세' },
];

export default function FortunePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'saju';
  const [result, setResult] = useState<FortuneResult | null>(null);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
    setResult(null);
  };

  const handleResult = (r: FortuneResult) => {
    setResult(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead
        title="무료 사주·별자리·커플 운세 | Planner 001"
        description="AI가 분석하는 무료 사주 풀이, 별자리 운세, 커플 궁합. 오늘의 운세도 확인하세요."
        keywords="무료 사주, 별자리 운세, 커플 궁합, 오늘의 운세, AI 사주 분석"
        breadcrumbs={[{ name: '홈', url: '/' }, { name: '운세·사주', url: '/fortune' }]}
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">운세·사주</h1>
            <p className="text-gray-500">AI가 분석하는 나만의 맞춤 운세를 확인해보세요</p>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 결과 표시 */}
          {result ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">운세 결과</h2>
                <button
                  onClick={() => setResult(null)}
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                >
                  다시 보기
                </button>
              </div>
              <FortuneDisplay result={result} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              {activeTab === 'saju' && <SajuForm onResult={handleResult} />}
              {activeTab === 'astrology' && <AstrologyForm onResult={handleResult} />}
              {activeTab === 'couple' && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-4">💕</p>
                  <p className="font-medium text-gray-600 mb-1">커플 궁합</p>
                  <p className="text-sm">두 사람의 사주를 분석하여 궁합을 알려드립니다.</p>
                  <p className="text-sm mt-4 text-indigo-500">커플 플래너와 함께 이용하시면 더욱 자세한 분석을 받으실 수 있습니다.</p>
                </div>
              )}
              {activeTab === 'daily' && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-4">☀️</p>
                  <p className="font-medium text-gray-600 mb-1">오늘의 운세</p>
                  <SajuForm onResult={handleResult} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

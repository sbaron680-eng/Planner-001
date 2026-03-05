import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Star, Heart, Sun } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import SajuForm from '@/components/Fortune/SajuForm';
import AstrologyForm from '@/components/Fortune/AstrologyForm';
import CoupleForm from '@/components/Fortune/CoupleForm';
import DailyFortuneForm from '@/components/Fortune/DailyFortuneForm';
import FortuneDisplay from '@/components/Fortune/FortuneDisplay';
import type { FortuneResult } from '@/types';

const TABS = [
  {
    id: 'saju',
    label: '사주 풀이',
    icon: Sparkles,
    emoji: '🔮',
    gradient: 'from-violet-600 to-purple-700',
    bgLight: 'from-violet-50 to-purple-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    desc: '사주팔자로 보는 나의 운명',
    activeCls: 'bg-violet-600 text-white shadow-md shadow-violet-200',
    inactiveCls: 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300',
  },
  {
    id: 'astrology',
    label: '별자리 운세',
    icon: Star,
    emoji: '⭐',
    gradient: 'from-indigo-600 to-blue-700',
    bgLight: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    desc: '서양 점성술로 보는 나의 운세',
    activeCls: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
    inactiveCls: 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300',
  },
  {
    id: 'couple',
    label: '커플 궁합',
    icon: Heart,
    emoji: '💕',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'from-rose-50 to-pink-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    desc: '두 사람의 사주로 보는 궁합',
    activeCls: 'bg-rose-500 text-white shadow-md shadow-rose-200',
    inactiveCls: 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300',
  },
  {
    id: 'daily',
    label: '오늘의 운세',
    icon: Sun,
    emoji: '☀️',
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    desc: '오늘 하루 별자리 운세',
    activeCls: 'bg-amber-500 text-white shadow-md shadow-amber-200',
    inactiveCls: 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300',
  },
] as const;

export default function FortunePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = (searchParams.get('tab') ?? 'saju') as typeof TABS[number]['id'];
  const [result, setResult] = useState<FortuneResult | null>(null);

  const activeTab = TABS.find(t => t.id === activeTabId) ?? TABS[0];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
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

      {/* 히어로 헤더 */}
      <div className={`bg-gradient-to-br ${activeTab.gradient} text-white py-10`}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-4xl mb-3">{activeTab.emoji}</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">{activeTab.label}</h1>
          <p className="text-white/70 text-sm">{activeTab.desc}</p>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* 탭 바 */}
          <div className="flex gap-2 overflow-x-auto pb-1 pt-6 mb-6 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTabId === tab.id ? tab.activeCls : tab.inactiveCls
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 결과 표시 */}
          {result ? (
            <div className="space-y-5">
              <div className={`flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${activeTab.bgLight} border ${activeTab.border}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeTab.emoji}</span>
                  <h2 className={`text-base font-bold ${activeTab.text}`}>운세 결과</h2>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className={`text-xs font-semibold ${activeTab.text} hover:opacity-70 transition-opacity`}
                >
                  다시 입력
                </button>
              </div>
              <FortuneDisplay result={result} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${activeTab.gradient}`} />
              <div className="p-6">
                {activeTabId === 'saju'      && <SajuForm onResult={handleResult} />}
                {activeTabId === 'astrology' && <AstrologyForm onResult={handleResult} />}
                {activeTabId === 'couple'    && <CoupleForm onResult={handleResult} />}
                {activeTabId === 'daily'     && <DailyFortuneForm onResult={handleResult} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

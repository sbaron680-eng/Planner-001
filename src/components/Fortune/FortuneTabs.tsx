import { Sparkles, Star, Heart, Sun } from 'lucide-react';

export const TABS = [
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

export type TabId = typeof TABS[number]['id'];
export type TabConfig = typeof TABS[number];

export function getTab(id: TabId): TabConfig {
  return TABS.find(t => t.id === id) ?? TABS[0];
}

interface Props {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function FortuneTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 pt-6 mb-6 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === tab.id ? tab.activeCls : tab.inactiveCls
          }`}
        >
          <span>{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

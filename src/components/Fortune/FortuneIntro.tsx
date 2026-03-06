import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { TabConfig } from './FortuneTabs';

interface Props {
  activeTab: TabConfig;
}

export default function FortuneIntro({ activeTab }: Props) {
  return (
    <div className={`bg-gradient-to-br ${activeTab.gradient} text-white py-10`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-4xl mb-3">{activeTab.emoji}</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          무료 사주·별자리·커플 운세 | 포춘탭
        </h1>
        <p className="text-white/80 text-sm mb-4 max-w-md mx-auto">
          사주, 별자리, 커플 궁합까지 한 번에 확인하고, 오늘의 계획에 바로 적용해보세요.
        </p>

        {/* 개인정보 안내 */}
        <div className="inline-flex items-center gap-1.5 text-white/60 text-xs mb-5">
          <ShieldCheck size={13} />
          <span>입력한 정보는 운세 분석과 플래너 추천에만 사용됩니다.</span>
        </div>

        {/* 상단 플래너 CTA */}
        <div className="flex justify-center">
          <Link
            to="/planners"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition-colors backdrop-blur-sm"
          >
            포춘탭 플래너와 함께 쓰면, 운세를 일정에 바로 적용할 수 있어요
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

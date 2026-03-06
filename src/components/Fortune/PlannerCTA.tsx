import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { TabId } from './FortuneTabs';

interface CTALink {
  label: string;
  href: string;
  primary: boolean;
}

interface CTAConfig {
  message: string;
  links: CTALink[];
  accentColor: string;
  bgColor: string;
  borderColor: string;
}

const CTA_CONFIG: Record<TabId, CTAConfig> = {
  saju: {
    message: '이 운세를 기반으로 한 달 계획을 세워보세요.',
    links: [
      { label: '사주 플래너 템플릿 보기', href: '/planners?category=saju', primary: true },
      { label: '올인원 운세 플래너 보기', href: '/planners/premium', primary: false },
    ],
    accentColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  astrology: {
    message: '별자리 운세 캘린더가 포함된 플래너로 매일 체크해보세요.',
    links: [
      { label: '별자리 운세 플래너 보기', href: '/planners?category=astrology', primary: true },
      { label: '무료 플래너 받기', href: '/planners/free', primary: false },
    ],
    accentColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  couple: {
    message: '커플 전용 플래너로 기념일과 데이트 일정까지 함께 관리해보세요.',
    links: [
      { label: '커플 플래너 보기', href: '/planners?category=couple', primary: true },
      { label: '프리미엄 플래너 전체 보기', href: '/planners/premium', primary: false },
    ],
    accentColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  daily: {
    message: '오늘 운세를 기반으로 할 일을 적어보세요.',
    links: [
      { label: '오늘 페이지가 있는 일일 플래너 받기', href: '/planners/premium', primary: true },
      { label: '무료 일간 플래너 사용하기', href: '/planners/free', primary: false },
    ],
    accentColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
};

interface Props {
  type: TabId;
}

export default function PlannerCTA({ type }: Props) {
  const cfg = CTA_CONFIG[type];

  return (
    <div className={`rounded-2xl border ${cfg.borderColor} ${cfg.bgColor} p-5 space-y-3`}>
      <p className={`text-sm font-semibold ${cfg.accentColor}`}>{cfg.message}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        {cfg.links.map((link) =>
          link.primary ? (
            <Link
              key={link.href}
              to={link.href}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              {link.label}
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              key={link.href}
              to={link.href}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
            >
              {link.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

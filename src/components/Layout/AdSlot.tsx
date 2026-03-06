/**
 * AdSlot — Google AdSense 광고 슬롯 컴포넌트
 *
 * ContentLayout(블로그/가이드)에서만 렌더링됩니다.
 * ProductLayout(플래너/운세)에서는 이 컴포넌트를 사용하지 않습니다.
 *
 * variant:
 *   'top'       - 본문 상단 (leaderboard, 728×90)
 *   'sidebar'   - 사이드바 고정형 (300×250 or 300×600)
 *   'in-article' - 본문 중간 인아티클 (반응형)
 */

export type AdSlotVariant = 'top' | 'sidebar' | 'in-article';

interface AdSlotProps {
  variant: AdSlotVariant;
  className?: string;
  /** Google AdSense 슬롯 ID (실 배포 시 설정) */
  slot?: string;
  /** AdSense publisher ID (실 배포 시 설정) */
  client?: string;
}

const SLOT_STYLES: Record<AdSlotVariant, string> = {
  top: 'w-full h-24 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400',
  sidebar: 'w-full h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400',
  'in-article': 'w-full h-28 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400',
};

export default function AdSlot({ variant, className = '', slot, client }: AdSlotProps) {
  const isDev = import.meta.env.DEV;

  if (isDev || !slot || !client) {
    // 개발 환경 또는 슬롯 미설정 시 플레이스홀더 표시
    return (
      <div className={`${SLOT_STYLES[variant]} ${className}`} aria-hidden="true">
        광고 슬롯 [{variant}]
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={variant === 'sidebar' ? 'rectangle' : 'auto'}
      data-full-width-responsive="true"
    />
  );
}

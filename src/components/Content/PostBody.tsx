/**
 * PostBody — 블로그/가이드 포스트 본문 렌더러
 *
 * ContentBlock 배열을 받아 HTML로 렌더링합니다.
 * MDX로 전환 시 이 컴포넌트를 교체하거나 래핑합니다.
 */

import { Info, AlertTriangle, Lightbulb } from 'lucide-react';
import type { ContentBlock } from '@/lib/content/types';
import AdSlot from '@/components/Layout/AdSlot';

interface PostBodyProps {
  blocks: ContentBlock[];
  /** 인아티클 광고를 삽입할 블록 인덱스 (기본: 3번째 블록 이후) */
  adAfterBlock?: number;
  showAds?: boolean;
  adClient?: string;
  adSlot?: string;
}

const CALLOUT_STYLES = {
  info: { bg: 'bg-blue-50 border-blue-200', icon: Info, iconColor: 'text-blue-500', textColor: 'text-blue-800' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-500', textColor: 'text-amber-800' },
  tip: { bg: 'bg-emerald-50 border-emerald-200', icon: Lightbulb, iconColor: 'text-emerald-500', textColor: 'text-emerald-800' },
};

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-gray-700 leading-relaxed">{block.text}</p>;

    case 'heading': {
      const Tag = `h${block.level ?? 2}` as 'h2' | 'h3' | 'h4';
      const sizeClass = block.level === 2 ? 'text-2xl font-bold mt-10 mb-4' : block.level === 3 ? 'text-xl font-semibold mt-8 mb-3' : 'text-lg font-semibold mt-6 mb-2';
      return <Tag className={`text-gray-900 ${sizeClass}`}>{block.text}</Tag>;
    }

    case 'list':
      return (
        <ul className="list-disc list-inside space-y-1.5 text-gray-700">
          {block.items?.map((item, i) => (
            <li key={i} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );

    case 'callout': {
      const style = CALLOUT_STYLES[block.calloutType ?? 'info'];
      const Icon = style.icon;
      return (
        <div className={`flex gap-3 p-4 rounded-xl border ${style.bg}`}>
          <Icon size={18} className={`flex-shrink-0 mt-0.5 ${style.iconColor}`} />
          <p className={`text-sm leading-relaxed ${style.textColor}`}>{block.text}</p>
        </div>
      );
    }

    case 'image':
      return (
        <figure className="my-2">
          <img
            src={block.src}
            alt={block.alt ?? ''}
            className="w-full rounded-xl border border-gray-100 shadow-sm"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">{block.caption}</figcaption>
          )}
        </figure>
      );

    case 'code':
      return (
        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed">
          <code>{block.text}</code>
        </pre>
      );

    default:
      return null;
  }
}

export default function PostBody({
  blocks,
  adAfterBlock = 3,
  showAds = false,
  adClient = '',
  adSlot = '',
}: PostBodyProps) {
  return (
    <div className="prose-spacing space-y-6">
      {blocks.map((block, i) => (
        <div key={i}>
          <Block block={block} />
          {showAds && i === adAfterBlock - 1 && (
            <div className="my-6">
              <AdSlot variant="in-article" client={adClient} slot={adSlot} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

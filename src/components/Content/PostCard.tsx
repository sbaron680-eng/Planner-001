/**
 * PostCard — 블로그/가이드 목록 페이지의 카드 컴포넌트
 */

import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import type { PostMeta } from '@/lib/content/types';

interface PostCardProps {
  post: PostMeta;
  basePath: '/blog' | '/guide';
}

export default function PostCard({ post, basePath }: PostCardProps) {
  const date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(post.publishedAt)
  );

  return (
    <Link
      to={`${basePath}/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      {/* 썸네일 */}
      {post.thumbnail ? (
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
          <span className="text-4xl">
            {post.type === 'blog' ? '📝' : '📖'}
          </span>
        </div>
      )}

      {/* 본문 */}
      <div className="flex flex-col flex-1 p-5">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>

        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">{post.description}</p>

        {/* 태그 + 읽기 시간 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Tag size={11} />
            <span>{post.tags.slice(0, 2).join(', ')}</span>
          </div>
          {post.readingTime && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} />
              <span>{post.readingTime}분</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

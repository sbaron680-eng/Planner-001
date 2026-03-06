import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import PostBody from '@/components/Content/PostBody';
import { getGuidePost } from '@/lib/content/guide';
import NotFoundPage from '../NotFoundPage';

export default function GuidePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getGuidePost(slug ?? '');

  if (!post) return <NotFoundPage />;

  const date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(post.publishedAt)
  );

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.description}
        path={`/guide/${post.slug}`}
        type="article"
      />

      <article className="max-w-3xl mx-auto">
        <Link to="/guide" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft size={14} /> 가이드 목록으로
        </Link>

        <div className="mb-6">
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            {post.category}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-gray-500 mb-6 leading-relaxed">{post.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-8 border-b border-gray-100 mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> {date}
          </span>
          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> 약 {post.readingTime}분
            </span>
          )}
        </div>

        <PostBody blocks={post.blocks} showAds />

        <div className="mt-10">
          <Link to="/guide" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft size={14} /> 가이드 목록
          </Link>
        </div>
      </article>
    </>
  );
}

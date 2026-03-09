import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import PostBody from '@/components/Content/PostBody';
import { getBlogPost } from '@/lib/content/blog';
import { buildArticleJsonLD } from '@/lib/seo';
import NotFoundPage from '../NotFoundPage';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug ?? '');

  if (!post) return <NotFoundPage />;

  const date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }).format(
    new Date(post.publishedAt)
  );

  const articleJsonLD = buildArticleJsonLD({
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    author: post.author,
    image: post.thumbnail,
    slug: post.slug,
  });

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.thumbnail}
        jsonLd={[articleJsonLD]}
      />

      <article className="max-w-3xl mx-auto">
        {/* 뒤로가기 */}
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft size={14} /> 블로그 목록으로
        </Link>

        {/* 썸네일 */}
        {post.thumbnail && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-100">
            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* 헤더 메타 */}
        <div className="mb-6">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            {post.category}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-gray-500 mb-6 leading-relaxed">{post.description}</p>

        {/* 메타 정보 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-8 border-b border-gray-100 mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> {date}
          </span>
          {post.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> 약 {post.readingTime}분
            </span>
          )}
          {post.author && <span>by {post.author}</span>}
        </div>

        {/* 본문 */}
        <PostBody blocks={post.blocks} showAds />

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
          {post.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>

        {/* 뒤로가기 */}
        <div className="mt-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft size={14} /> 블로그 목록
          </Link>
        </div>
      </article>
    </>
  );
}

import SEOHead from '@/components/Layout/SEOHead';
import PostCard from '@/components/Content/PostCard';
import { blogPosts } from '@/lib/content/blog';

export default function BlogListPage() {
  return (
    <>
      <SEOHead
        title="블로그"
        description="플래너 활용법, 운세·사주 이야기, 생산성 팁 등 다양한 콘텐츠를 소개합니다."
        path="/blog"
      />

      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">블로그</h1>
          <p className="text-gray-500">플래너 활용법, 운세 이야기, 생산성 팁을 소개합니다.</p>
        </div>

        {/* 포스트 그리드 */}
        {blogPosts.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">아직 게시된 글이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <PostCard key={post.slug} post={post} basePath="/blog" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

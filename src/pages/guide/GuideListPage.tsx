import SEOHead from '@/components/Layout/SEOHead';
import PostCard from '@/components/Content/PostCard';
import { guidePosts } from '@/lib/content/guide';

export default function GuideListPage() {
  return (
    <>
      <SEOHead
        title="이용 가이드"
        description="포춘탭 서비스 이용 방법, PDF 플래너 활용법, 프리미엄 기능 안내를 단계별로 설명합니다."
        path="/guide"
      />

      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">이용 가이드</h1>
          <p className="text-gray-500">서비스 이용 방법과 기능을 단계별로 안내합니다.</p>
        </div>

        {guidePosts.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">가이드 문서가 준비 중입니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {guidePosts.map((post) => (
              <PostCard key={post.slug} post={post} basePath="/guide" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

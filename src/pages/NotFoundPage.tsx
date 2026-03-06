import { Link } from 'react-router-dom';
import SEOHead from '@/components/Layout/SEOHead';

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="페이지를 찾을 수 없습니다 | 포춘탭" description="요청하신 페이지를 찾을 수 없습니다." />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-8xl font-bold text-indigo-100 mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
          <p className="text-gray-500 mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </>
  );
}

import { createBrowserRouter } from 'react-router-dom';

// Layouts
import ProductLayout from './components/Layout/ProductLayout';
import ContentLayout from './components/Layout/ContentLayout';

// Product pages (플래너 / 운세 — 광고 없음)
import HomePage from './pages/HomePage';
import FreePlannersPage from './pages/FreePlannersPage';
import PremiumPlannersPage from './pages/PremiumPlannersPage';
import PlannerDetailPage from './pages/PlannerDetailPage';
import FortunePage from './pages/FortunePage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';

// User pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

// Content pages (블로그 / 가이드 — 광고 있음)
import BlogListPage from './pages/blog/BlogListPage';
import BlogPostPage from './pages/blog/BlogPostPage';
import GuideListPage from './pages/guide/GuideListPage';
import GuidePostPage from './pages/guide/GuidePostPage';

// Static / Support pages
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    /**
     * ProductLayout — 플래너, 운세, 인증, 대시보드
     * 광고 없음 / 전환율 최우선
     */
    element: <ProductLayout />,
    children: [
      { path: '/', element: <HomePage /> },

      // 플래너
      { path: 'planners/free', element: <FreePlannersPage /> },
      { path: 'planners/premium', element: <PremiumPlannersPage /> },
      { path: 'planners/:slug', element: <PlannerDetailPage /> },

      // 운세·사주
      { path: 'fortune', element: <FortunePage /> },

      // 인증
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'auth/oauth', element: <OAuthCallbackPage /> },

      // 유저
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'admin', element: <AdminPage /> },

      // 정적 지원 페이지 (광고 없음)
      { path: 'faq', element: <FAQPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'contact', element: <ContactPage /> },

      // 404
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    /**
     * ContentLayout — 블로그, 가이드
     * 광고 슬롯 포함 (AdSense)
     */
    element: <ContentLayout />,
    children: [
      // 블로그
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },

      // 가이드
      { path: 'guide', element: <GuideListPage /> },
      { path: 'guide/:slug', element: <GuidePostPage /> },
    ],
  },
]);

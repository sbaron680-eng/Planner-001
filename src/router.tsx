import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import FreePlannersPage from './pages/FreePlannersPage';
import PremiumPlannersPage from './pages/PremiumPlannersPage';
import PlannerDetailPage from './pages/PlannerDetailPage';
import FortunePage from './pages/FortunePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'planners/free', element: <FreePlannersPage /> },
      { path: 'planners/premium', element: <PremiumPlannersPage /> },
      { path: 'planners/:slug', element: <PlannerDetailPage /> },
      { path: 'fortune', element: <FortunePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'auth/oauth', element: <OAuthCallbackPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

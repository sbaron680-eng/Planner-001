import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Users, ShoppingBag, FileText, TrendingUp } from 'lucide-react';
import SEOHead from '@/components/Layout/SEOHead';
import { useAuthStore, isAdmin } from '@/store/useAuthStore';
import type { AdminStats } from '@/types';

export default function AdminPage() {
  const { user, isLoading, fetchMe } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (isAdmin()) {
      fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((r) => r.json())
        .then((d) => { if (d.ok) setStats(d.data); })
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin()) return <Navigate to="/" replace />;

  const statCards = stats ? [
    { label: '전체 사용자', value: stats.total_users.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: '프리미엄 사용자', value: stats.premium_users.toLocaleString(), icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600' },
    { label: '전체 구매', value: stats.total_purchases.toLocaleString(), icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
    { label: '총 매출', value: `${stats.total_revenue.toLocaleString()}원`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    { label: 'PDF 생성', value: stats.pdfs_generated.toLocaleString(), icon: FileText, color: 'bg-purple-50 text-purple-600' },
    { label: '운세 요청', value: stats.fortune_requests.toLocaleString(), icon: FileText, color: 'bg-pink-50 text-pink-600' },
  ] : [];

  return (
    <>
      <SEOHead title="관리자 | 포춘탭" description="관리자 대시보드" />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">관리자 대시보드</h1>

          {statsLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {statCards.map((card) => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className={`inline-flex p-2.5 rounded-xl ${card.color} mb-3`}>
                    <card.icon size={18} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

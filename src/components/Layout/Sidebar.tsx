import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  Clock,
  Target,
  BookOpen,
} from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import type { Section } from '../../types';

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={20} /> },
  { id: 'tasks', label: '할 일', icon: <CheckSquare size={20} /> },
  { id: 'calendar', label: '캘린더', icon: <CalendarDays size={20} /> },
  { id: 'daily', label: '일일 플래너', icon: <Clock size={20} /> },
  { id: 'goals', label: '목표', icon: <Target size={20} /> },
  { id: 'notes', label: '노트', icon: <BookOpen size={20} /> },
];

export default function Sidebar() {
  const { activeSection, setActiveSection } = usePlannerStore();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-white flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-wide text-primary-400">Planner 001</h1>
        <p className="text-xs text-gray-400 mt-0.5">통합 플래너</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
              activeSection === item.id
                ? 'bg-primary-600 text-white font-medium'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-gray-700 text-xs text-gray-500">
        v1.0.0
      </div>
    </aside>
  );
}

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { usePlannerStore } from '../../store/usePlannerStore';

const sectionLabels: Record<string, string> = {
  dashboard: '대시보드',
  tasks: '할 일',
  calendar: '캘린더',
  daily: '일일 플래너',
  goals: '목표',
  notes: '노트',
};

export default function Header() {
  const { activeSection } = usePlannerStore();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold text-gray-800">
        {sectionLabels[activeSection]}
      </h2>
      <span className="text-sm text-gray-500">
        {format(new Date(), 'yyyy년 M월 d일 (eee)', { locale: ko })}
      </span>
    </header>
  );
}

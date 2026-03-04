import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarView() {
  const { tasks, timeBlocks, setActiveSection, setSelectedDate } =
    usePlannerStore();
  const [current, setCurrent] = useState(new Date());

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 0=Sun

  function handleDayClick(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setActiveSection('daily');
  }

  function getTasksForDay(day: Date) {
    return tasks.filter(
      (t) => t.dueDate && isSameDay(parseISO(t.dueDate), day)
    );
  }

  function getBlocksForDay(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    return timeBlocks.filter((b) => b.date === dateStr);
  }

  return (
    <div className="p-6">
      {/* 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrent((d) => subMonths(d, 1))}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-base font-semibold text-gray-800">
          {format(current, 'yyyy년 M월', { locale: ko })}
        </h3>
        <button
          onClick={() => setCurrent((d) => addMonths(d, 1))}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-2 ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
        {/* 앞 패딩 */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} className="bg-gray-50 min-h-[80px]" />
        ))}

        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const dayBlocks = getBlocksForDay(day);
          const isToday = isSameDay(day, new Date());
          const dow = getDay(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`bg-white min-h-[80px] p-1.5 cursor-pointer hover:bg-primary-50 transition-colors`}
            >
              <span
                className={`text-xs font-medium inline-flex w-6 h-6 items-center justify-center rounded-full ${
                  isToday
                    ? 'bg-primary-600 text-white'
                    : dow === 0
                    ? 'text-red-500'
                    : dow === 6
                    ? 'text-blue-500'
                    : 'text-gray-700'
                }`}
              >
                {format(day, 'd')}
              </span>

              <div className="mt-1 space-y-0.5">
                {dayBlocks.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    className="text-xs px-1 rounded truncate text-white"
                    style={{ backgroundColor: b.color }}
                  >
                    {b.startTime} {b.title}
                  </div>
                ))}
                {dayTasks.slice(0, 2).map((t) => (
                  <div
                    key={t.id}
                    className={`text-xs px-1 rounded truncate ${
                      t.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : t.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length + dayBlocks.length > 2 && (
                  <div className="text-xs text-gray-400 pl-1">
                    +{dayTasks.length + dayBlocks.length - 2}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        날짜를 클릭하면 해당 날짜의 일일 플래너로 이동합니다.
      </p>
    </div>
  );
}

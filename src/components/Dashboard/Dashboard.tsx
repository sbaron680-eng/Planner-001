import { format, isToday, parseISO, isPast } from 'date-fns';
import { usePlannerStore } from '../../store/usePlannerStore';
import { CheckSquare, Target, BookOpen, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { tasks, goals, notes, timeBlocks, setActiveSection } = usePlannerStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayTasks = tasks.filter(
    (t) => t.dueDate === today && t.status !== 'done'
  );
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== 'done' &&
      isPast(parseISO(t.dueDate)) &&
      t.dueDate !== today
  );
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const todayBlocks = timeBlocks.filter((b) => b.date === today);
  const avgGoalProgress =
    goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
      : 0;

  const stats = [
    {
      label: '오늘 할 일',
      value: todayTasks.length,
      sub: `완료 ${doneTasks.length}개`,
      icon: <CheckSquare size={22} className="text-blue-500" />,
      bg: 'bg-blue-50',
      section: 'tasks' as const,
    },
    {
      label: '기한 초과',
      value: overdueTasks.length,
      sub: '처리 필요',
      icon: <AlertCircle size={22} className="text-red-500" />,
      bg: 'bg-red-50',
      section: 'tasks' as const,
    },
    {
      label: '목표 달성률',
      value: `${avgGoalProgress}%`,
      sub: `총 ${goals.length}개 목표`,
      icon: <Target size={22} className="text-purple-500" />,
      bg: 'bg-purple-50',
      section: 'goals' as const,
    },
    {
      label: '오늘 일정',
      value: todayBlocks.length,
      sub: '시간 블록',
      icon: <Clock size={22} className="text-green-500" />,
      bg: 'bg-green-50',
      section: 'daily' as const,
    },
    {
      label: '노트',
      value: notes.length,
      sub: `고정 ${notes.filter((n) => n.isPinned).length}개`,
      icon: <BookOpen size={22} className="text-yellow-500" />,
      bg: 'bg-yellow-50',
      section: 'notes' as const,
    },
    {
      label: '전체 할 일',
      value: tasks.length,
      sub: `진행 중 ${tasks.filter((t) => t.status === 'in_progress').length}개`,
      icon: <TrendingUp size={22} className="text-indigo-500" />,
      bg: 'bg-indigo-50',
      section: 'tasks' as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setActiveSection(s.section)}
            className={`${s.bg} rounded-xl p-4 text-left hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-3 mb-2">
              {s.icon}
              <span className="text-sm text-gray-600 font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 오늘 할 일 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckSquare size={16} className="text-blue-500" />
            오늘 할 일
          </h3>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-gray-400">오늘 예정된 할 일이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {todayTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      t.priority === 'high'
                        ? 'bg-red-400'
                        : t.priority === 'medium'
                        ? 'bg-yellow-400'
                        : 'bg-green-400'
                    }`}
                  />
                  <span className="text-gray-700 truncate">{t.title}</span>
                </li>
              ))}
              {todayTasks.length > 5 && (
                <li className="text-xs text-gray-400">+{todayTasks.length - 5}개 더</li>
              )}
            </ul>
          )}
        </div>

        {/* 목표 진행 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Target size={16} className="text-purple-500" />
            목표 진행 현황
          </h3>
          {goals.length === 0 ? (
            <p className="text-sm text-gray-400">등록된 목표가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {goals.slice(0, 4).map((g) => (
                <li key={g.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{g.title}</span>
                    <span className="text-gray-500 ml-2 shrink-0">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 오늘 일정 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-green-500" />
            오늘 시간 블록
          </h3>
          {todayBlocks.length === 0 ? (
            <p className="text-sm text-gray-400">오늘 등록된 일정이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {[...todayBlocks]
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .slice(0, 5)
                .map((b) => (
                  <li key={b.id} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: b.color }}
                    />
                    <span className="text-gray-500 shrink-0">
                      {b.startTime}–{b.endTime}
                    </span>
                    <span className="text-gray-700 truncate">{b.title}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* 고정 노트 */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-yellow-500" />
            고정 노트
          </h3>
          {notes.filter((n) => n.isPinned).length === 0 ? (
            <p className="text-sm text-gray-400">고정된 노트가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {notes
                .filter((n) => n.isPinned)
                .slice(0, 4)
                .map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className="font-medium text-gray-700 truncate">{n.title}</p>
                    <p className="text-gray-400 text-xs truncate">{n.content}</p>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

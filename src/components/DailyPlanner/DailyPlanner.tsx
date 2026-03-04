import { useState } from 'react';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

const COLORS = [
  '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6',
];

const HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0') + ':00'
);

interface FormState {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  color: string;
}

const defaultForm: FormState = {
  startTime: '09:00',
  endTime: '10:00',
  title: '',
  description: '',
  color: COLORS[0],
};

export default function DailyPlanner() {
  const { timeBlocks, selectedDate, setSelectedDate, addTimeBlock, deleteTimeBlock } =
    usePlannerStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);

  const dayBlocks = timeBlocks
    .filter((b) => b.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  function handleSubmit() {
    if (!form.title.trim()) return;
    addTimeBlock({ ...form, date: selectedDate });
    setForm(defaultForm);
    setShowForm(false);
  }

  function prevDay() {
    const d = parseISO(selectedDate);
    setSelectedDate(format(subDays(d, 1), 'yyyy-MM-dd'));
  }

  function nextDay() {
    const d = parseISO(selectedDate);
    setSelectedDate(format(addDays(d, 1), 'yyyy-MM-dd'));
  }

  function toToday() {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
  }

  // 시간 → 분 변환
  function toMin(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  return (
    <div className="p-6 flex gap-6">
      {/* 좌측: 타임라인 */}
      <div className="flex-1">
        {/* 날짜 네비게이션 */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={toToday}
            className="text-sm font-semibold text-gray-800 hover:text-primary-600"
          >
            {format(parseISO(selectedDate), 'yyyy년 M월 d일 (eee)', { locale: ko })}
          </button>
          <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronRight size={18} />
          </button>
          <span className="text-xs text-gray-400">오늘 클릭 시 오늘로 이동</span>
        </div>

        {/* 타임라인 */}
        <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden">
          {HOURS.filter((_, i) => i >= 6 && i <= 22).map((hour) => {
            const hourMin = toMin(hour);
            const blocksInHour = dayBlocks.filter((b) => {
              const s = toMin(b.startTime);
              return s >= hourMin && s < hourMin + 60;
            });

            return (
              <div
                key={hour}
                className="flex border-b border-gray-100 last:border-b-0"
                style={{ minHeight: '52px' }}
              >
                <div className="w-14 text-right pr-3 py-2 text-xs text-gray-400 shrink-0">
                  {hour}
                </div>
                <div className="flex-1 relative py-1 pl-2 pr-3">
                  {blocksInHour.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between group mb-1 px-2 py-1 rounded-lg text-white text-xs"
                      style={{ backgroundColor: b.color }}
                    >
                      <span>
                        <strong>{b.startTime}–{b.endTime}</strong>
                        {' '}{b.title}
                        {b.description && (
                          <span className="opacity-80 ml-1">— {b.description}</span>
                        )}
                      </span>
                      <button
                        onClick={() => deleteTimeBlock(b.id)}
                        className="opacity-0 group-hover:opacity-100 ml-2 hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측: 폼 */}
      <div className="w-64 shrink-0">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-primary-700 mb-4"
        >
          <Plus size={16} />
          시간 블록 추가
        </button>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="제목 *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">시작</label>
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">종료</label>
                <input
                  type="time"
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="메모 (선택)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">색상</label>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                추가
              </button>
            </div>
          </div>
        )}

        {/* 오늘 블록 요약 */}
        {dayBlocks.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {dayBlocks.length}개 일정
            </h4>
            {dayBlocks.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg p-2 group"
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: b.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{b.title}</p>
                  <p className="text-xs text-gray-400">
                    {b.startTime}–{b.endTime}
                  </p>
                </div>
                <button
                  onClick={() => deleteTimeBlock(b.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';

interface GoalForm {
  title: string;
  description: string;
  category: string;
  targetDate: string;
}

const defaultForm: GoalForm = {
  title: '',
  description: '',
  category: '개인',
  targetDate: '',
};

const CATEGORIES = ['개인', '직업', '학습', '건강', '재정', '관계', '취미', '기타'];

export default function Goals() {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
  } = usePlannerStore();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GoalForm>(defaultForm);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [milestoneInput, setMilestoneInput] = useState<Record<string, string>>({});
  const [milestoneDateInput, setMilestoneDateInput] = useState<Record<string, string>>({});

  function handleAddGoal() {
    if (!form.title.trim()) return;
    addGoal({ ...form });
    setForm(defaultForm);
    setShowForm(false);
  }

  function handleAddMilestone(goalId: string) {
    const text = milestoneInput[goalId]?.trim();
    if (!text) return;
    addMilestone(goalId, text, milestoneDateInput[goalId]);
    setMilestoneInput((prev) => ({ ...prev, [goalId]: '' }));
    setMilestoneDateInput((prev) => ({ ...prev, [goalId]: '' }));
  }

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">총 {goals.length}개 목표</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <Plus size={16} />
          목표 추가
        </button>
      </div>

      {/* 목표 추가 폼 */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-700">새 목표</h3>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="목표 제목 *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
            rows={2}
            placeholder="설명 (선택)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleAddGoal}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 목표 목록 */}
      {goals.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">등록된 목표가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* 목표 헤더 */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      setExpandedGoal(expandedGoal === goal.id ? null : goal.id)
                    }
                    className="mt-0.5 text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    {expandedGoal === goal.id ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{goal.title}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                        {goal.category}
                      </span>
                      {goal.targetDate && (
                        <span className="text-xs text-gray-400">
                          목표일: {goal.targetDate}
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{goal.description}</p>
                    )}
                    {/* 진행률 바 */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>진행률</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-300 hover:text-red-500 shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* 마일스톤 */}
              {expandedGoal === goal.id && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    마일스톤 ({goal.milestones.filter((m) => m.completed).length}/
                    {goal.milestones.length})
                  </h4>

                  {goal.milestones.length === 0 ? (
                    <p className="text-xs text-gray-400 mb-2">마일스톤을 추가하세요.</p>
                  ) : (
                    <ul className="space-y-1.5 mb-3">
                      {goal.milestones.map((m) => (
                        <li key={m.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => toggleMilestone(goal.id, m.id)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              m.completed
                                ? 'bg-purple-500 border-purple-500 text-white'
                                : 'border-gray-300 hover:border-purple-400'
                            }`}
                          >
                            {m.completed && <Check size={12} />}
                          </button>
                          <span
                            className={`text-sm flex-1 ${
                              m.completed
                                ? 'line-through text-gray-400'
                                : 'text-gray-700'
                            }`}
                          >
                            {m.title}
                          </span>
                          {m.dueDate && (
                            <span className="text-xs text-gray-400">{m.dueDate}</span>
                          )}
                          <button
                            onClick={() => deleteMilestone(goal.id, m.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* 마일스톤 추가 */}
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                      placeholder="새 마일스톤"
                      value={milestoneInput[goal.id] ?? ''}
                      onChange={(e) =>
                        setMilestoneInput((prev) => ({
                          ...prev,
                          [goal.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddMilestone(goal.id);
                      }}
                    />
                    <input
                      type="date"
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                      value={milestoneDateInput[goal.id] ?? ''}
                      onChange={(e) =>
                        setMilestoneDateInput((prev) => ({
                          ...prev,
                          [goal.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      onClick={() => handleAddMilestone(goal.id)}
                      className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import type { Priority, Status } from '../../types';

const PRIORITY_LABEL: Record<Priority, string> = {
  low: '낮음',
  medium: '중간',
  high: '높음',
};

const PRIORITY_COLOR: Record<Priority, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<Status, string> = {
  todo: '할 일',
  in_progress: '진행 중',
  done: '완료',
};

interface FormState {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  tags: string;
}

const defaultForm: FormState = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: '',
  tags: '',
};

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskDone } =
    usePlannerStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = tasks
    .filter((t) => (filter === 'all' ? true : t.status === filter))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === 'dueDate') {
        return (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

  function handleSubmit() {
    if (!form.title.trim()) return;
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editId) {
      updateTask(editId, { ...form, tags });
      setEditId(null);
    } else {
      addTask({ ...form, tags });
    }
    setForm(defaultForm);
    setShowForm(false);
  }

  function startEdit(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ?? '',
      tags: task.tags.join(', '),
    });
    setEditId(id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm(defaultForm);
    setEditId(null);
    setShowForm(false);
  }

  return (
    <div className="p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'todo', 'in_progress', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '전체' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as typeof sortBy)
            }
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <option value="createdAt">생성일순</option>
            <option value="dueDate">마감일순</option>
            <option value="priority">우선순위순</option>
          </select>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
            className="flex items-center gap-1.5 bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            <Plus size={16} />
            추가
          </button>
        </div>
      </div>

      {/* 폼 */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-700">
            {editId ? '할 일 수정' : '새 할 일'}
          </h3>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="제목 *"
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
          <div className="grid grid-cols-3 gap-3">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="high">높음</option>
              <option value="medium">중간</option>
              <option value="low">낮음</option>
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="todo">할 일</option>
              <option value="in_progress">진행 중</option>
              <option value="done">완료</option>
            </select>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="태그 (쉼표로 구분)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelForm}
              className="px-4 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {editId ? '저장' : '추가'}
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            할 일이 없습니다.
          </p>
        )}
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`bg-white border rounded-xl p-4 flex items-start gap-3 group transition-opacity ${
              task.status === 'done' ? 'opacity-60' : ''
            }`}
          >
            <button
              onClick={() => toggleTaskDone(task.id)}
              className="mt-0.5 text-gray-400 hover:text-primary-600 shrink-0"
            >
              {task.status === 'done' ? (
                <CheckCircle2 size={20} className="text-primary-500" />
              ) : (
                <Circle size={20} />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-medium ${
                    task.status === 'done'
                      ? 'line-through text-gray-400'
                      : 'text-gray-800'
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority]}`}
                >
                  {PRIORITY_LABEL[task.priority]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {STATUS_LABEL[task.status]}
                </span>
              </div>
              {task.description && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {task.dueDate && (
                  <span className="text-xs text-gray-400">
                    마감: {task.dueDate}
                  </span>
                )}
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(task.id)}
                className="text-gray-400 hover:text-blue-500 p-1"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

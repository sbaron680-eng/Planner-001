import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { Task, TimeBlock, Goal, Note, Section, Milestone } from '../types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface PlannerState {
  // 현재 섹션
  activeSection: Section;
  setActiveSection: (section: Section) => void;

  // ── 할 일 ──────────────────────────────────────
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;

  // ── 일일 플래너 ───────────────────────────────
  timeBlocks: TimeBlock[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, patch: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;

  // ── 목표 ──────────────────────────────────────
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'milestones'>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMilestone: (goalId: string, title: string, dueDate?: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;

  // ── 노트 ──────────────────────────────────────
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      activeSection: 'dashboard',
      setActiveSection: (section) => set({ activeSection: section }),

      // ── 할 일 ──────────────────────────────────────
      tasks: [],
      addTask: (task) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            { ...task, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleTaskDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'done' ? 'todo' : 'done',
                  completedAt:
                    t.status !== 'done' ? new Date().toISOString() : undefined,
                }
              : t
          ),
        })),

      // ── 일일 플래너 ───────────────────────────────
      timeBlocks: [],
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      setSelectedDate: (date) => set({ selectedDate: date }),
      addTimeBlock: (block) =>
        set((s) => ({
          timeBlocks: [...s.timeBlocks, { ...block, id: uid() }],
        })),
      updateTimeBlock: (id, patch) =>
        set((s) => ({
          timeBlocks: s.timeBlocks.map((b) =>
            b.id === id ? { ...b, ...patch } : b
          ),
        })),
      deleteTimeBlock: (id) =>
        set((s) => ({
          timeBlocks: s.timeBlocks.filter((b) => b.id !== id),
        })),

      // ── 목표 ──────────────────────────────────────
      goals: [],
      addGoal: (goal) =>
        set((s) => ({
          goals: [
            ...s.goals,
            {
              ...goal,
              id: uid(),
              createdAt: new Date().toISOString(),
              progress: 0,
              milestones: [],
            },
          ],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      addMilestone: (goalId, title, dueDate) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const milestones: Milestone[] = [
              ...g.milestones,
              { id: uid(), title, completed: false, dueDate },
            ];
            const progress = calcProgress(milestones);
            return { ...g, milestones, progress };
          }),
        })),
      toggleMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const milestones = g.milestones.map((m) =>
              m.id === milestoneId ? { ...m, completed: !m.completed } : m
            );
            const progress = calcProgress(milestones);
            return { ...g, milestones, progress };
          }),
        })),
      deleteMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const milestones = g.milestones.filter(
              (m) => m.id !== milestoneId
            );
            const progress = calcProgress(milestones);
            return { ...g, milestones, progress };
          }),
        })),

      // ── 노트 ──────────────────────────────────────
      notes: [],
      addNote: (note) =>
        set((s) => ({
          notes: [
            ...s.notes,
            {
              ...note,
              id: uid(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id
              ? { ...n, ...patch, updatedAt: new Date().toISOString() }
              : n
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      togglePinNote: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, isPinned: !n.isPinned } : n
          ),
        })),
    }),
    { name: 'planner-001-store' }
  )
);

function calcProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const done = milestones.filter((m) => m.completed).length;
  return Math.round((done / milestones.length) * 100);
}

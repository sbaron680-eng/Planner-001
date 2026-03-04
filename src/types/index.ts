// ===========================
// 공통 타입
// ===========================
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'done';

// ===========================
// 할 일 (Task)
// ===========================
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;       // ISO date string (YYYY-MM-DD)
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

// ===========================
// 일일 시간 블록 (TimeBlock)
// ===========================
export interface TimeBlock {
  id: string;
  date: string;           // YYYY-MM-DD
  startTime: string;      // HH:MM
  endTime: string;        // HH:MM
  title: string;
  description?: string;
  color: string;          // hex color
}

// ===========================
// 목표 (Goal)
// ===========================
export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;       // 0-100
  milestones: Milestone[];
  category: string;
  createdAt: string;
}

// ===========================
// 노트 (Note)
// ===========================
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// 네비게이션
// ===========================
export type Section =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'daily'
  | 'goals'
  | 'notes';

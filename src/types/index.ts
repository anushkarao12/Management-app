import type { TASK_STATUS, TASK_PRIORITY, USER_ROLES, PROJECT_STATUS } from '@/lib/constants';

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  memberIds: string[];
  ownerId: string;
  dueDate: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  comments: TaskComment[];
  createdAt: string;
  createdById: string;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  actorId: string;
  action: string;
  resourceType: 'project' | 'task' | 'user';
  resourceId: string;
  resourceName: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Workspace {
  projects: Project[];
  tasks: Task[];
  members: User[];
  activities: ActivityEvent[];
}

// UI State types
export interface FilterState {
  search: string;
  status?: string;
  priority?: string;
  projectId?: string;
  assigneeId?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

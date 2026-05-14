export const STORAGE_KEYS = {
  AUTH_TOKEN: 'tf_auth',
  USER_PREFERENCES: 'tf_prefs',
  THEME: 'tf_theme',
} as const;

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const ROUTES = {
  DASHBOARD: 'dashboard',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  TEAM: 'team',
  SETTINGS: 'settings',
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  PROJECTS: '/api/v1/projects',
  TASKS: '/api/v1/tasks',
  USERS: '/api/v1/users',
} as const;

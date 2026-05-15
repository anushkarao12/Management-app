import { useState, useCallback, useMemo } from 'react';
import { projectService, taskService, userService, activityService } from '@/services/database';
import type { Project, Task, User, FilterState } from '@/types';

export function useProjects(filter?: FilterState) {
  const [refreshKey, setRefreshKey] = useState(0);

  const projects = useMemo(() => {
    let items = projectService.getAll();
    if (filter?.search) {
      const query = filter.search.toLowerCase();
      items = items.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }
    if (filter?.status && filter.status !== 'all') {
      items = items.filter(p => p.status === filter.status);
    }
    return items.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filter?.search, filter?.status, refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const create = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = projectService.create(data);
    refresh();
    return result;
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Project>) => {
    const result = projectService.update(id, data);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const result = projectService.delete(id);
    refresh();
    return result;
  }, [refresh]);

  // FIX: Wrap getById in a callback so `this` context is preserved via
  // the service object reference (projectService.getById already uses
  // projectService.getAll() internally after the database.ts fix)
  const getById = useCallback((id: string) => {
    return projectService.getById(id);
  }, []);

  return { projects, create, update, remove, refresh, getById };
}

export function useTasks(filter?: FilterState) {
  const [refreshKey, setRefreshKey] = useState(0);

  const tasks = useMemo(() => {
    let items = taskService.getAll();
    if (filter?.search) {
      const query = filter.search.toLowerCase();
      items = items.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }
    if (filter?.status && filter.status !== 'all') {
      items = items.filter(t => t.status === filter.status);
    }
    if (filter?.priority && filter.priority !== 'all') {
      items = items.filter(t => t.priority === filter.priority);
    }
    if (filter?.projectId && filter.projectId !== 'all') {
      items = items.filter(t => t.projectId === filter.projectId);
    }
    if (filter?.assigneeId) {
      items = items.filter(t => t.assigneeId === filter.assigneeId);
    }
    return items.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filter, refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const create = useCallback((data: Omit<Task, 'id' | 'comments' | 'createdAt'>) => {
    const result = taskService.create(data);
    refresh();
    return result;
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Task>, actorId?: string) => {
    const result = taskService.update(id, data, actorId);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((id: string) => {
    const result = taskService.delete(id);
    refresh();
    return result;
  }, [refresh]);

  const addComment = useCallback((taskId: string, content: string, authorId: string) => {
    const result = taskService.addComment(taskId, content, authorId);
    refresh();
    return result;
  }, [refresh]);

  // FIX: Wrap getById in a callback to preserve proper function reference
  const getById = useCallback((id: string) => {
    return taskService.getById(id);
  }, []);

  const getByProject = useCallback((projectId: string) => {
    return taskService.getByProject(projectId);
  }, []);

  return { tasks, create, update, remove, addComment, refresh, getById, getByProject };
}

export function useTeam(filter?: { search?: string; role?: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const members = useMemo(() => {
    let items = userService.getAll();
    if (filter?.search) {
      const query = filter.search.toLowerCase();
      items = items.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }
    if (filter?.role && filter.role !== 'all') {
      items = items.filter(u => u.role === filter.role);
    }
    return items;
  }, [filter?.search, filter?.role, refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const updateRole = useCallback((userId: string, role: User['role']) => {
    const result = userService.update(userId, { role });
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback((userId: string) => {
    const result = userService.delete(userId);
    refresh();
    return result;
  }, [refresh]);

  return { members, updateRole, remove, refresh, getById: (id: string) => userService.getById(id) };
}

export function useActivity(limit = 10) {
  const [refreshKey, setRefreshKey] = useState(0);

  const activities = useMemo(() => {
    return activityService.getRecent(limit);
  }, [limit, refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return { activities, refresh };
}

// Stats hook for dashboard
export function useWorkspaceStats(userId?: string) {
  const projects = projectService.getAll();
  const tasks = taskService.getAll();

  return useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const overdue = tasks.filter(t =>
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;
    const myTasks = userId ? tasks.filter(t => t.assigneeId === userId).length : 0;

    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completed,
      inProgress,
      todo,
      overdue,
      myTasks,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [projects, tasks, userId]);
}

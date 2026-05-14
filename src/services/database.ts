import type { User, Project, Task, ActivityEvent, TaskComment } from '@/types';
import { generateId } from '@/lib/utils';
import { storage } from './storage';

const COLLECTIONS = {
  users: 'users',
  projects: 'projects', 
  tasks: 'tasks',
  activities: 'activities',
  session: 'session',
} as const;

// Seed data for demo purposes
function initializeDemoData(): void {
  if (storage.get<User[]>(COLLECTIONS.users, []).length > 0) return;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const users: User[] = [
    { id: 'usr_1', name: 'Alex Morrison', email: 'alex@company.io', role: 'admin', createdAt: twoWeeksAgo.toISOString() },
    { id: 'usr_2', name: 'Sarah Chen', email: 'sarah@company.io', role: 'member', createdAt: weekAgo.toISOString() },
    { id: 'usr_3', name: 'Marcus Johnson', email: 'marcus@company.io', role: 'member', createdAt: weekAgo.toISOString() },
    { id: 'usr_4', name: 'Emily Rodriguez', email: 'emily@company.io', role: 'member', createdAt: now.toISOString() },
    { id: 'usr_5', name: 'David Kim', email: 'david@company.io', role: 'admin', createdAt: twoWeeksAgo.toISOString() },
  ];

  const projects: Project[] = [
    {
      id: 'prj_1', title: 'Platform Redesign', description: 'Complete overhaul of the customer-facing platform with updated design system.',
      memberIds: ['usr_1', 'usr_2', 'usr_3'], ownerId: 'usr_1',
      dueDate: new Date(now.getTime() + 30 * 86400000).toISOString(), status: 'active',
      createdAt: twoWeeksAgo.toISOString(), updatedAt: twoWeeksAgo.toISOString(),
    },
    {
      id: 'prj_2', title: 'Mobile App v2', description: 'Native mobile application with offline support and push notifications.',
      memberIds: ['usr_1', 'usr_3', 'usr_4'], ownerId: 'usr_1',
      dueDate: new Date(now.getTime() + 60 * 86400000).toISOString(), status: 'active',
      createdAt: weekAgo.toISOString(), updatedAt: weekAgo.toISOString(),
    },
    {
      id: 'prj_3', title: 'API Integration', description: 'Third-party payment and analytics integrations.',
      memberIds: ['usr_2', 'usr_5'], ownerId: 'usr_5',
      dueDate: new Date(now.getTime() + 14 * 86400000).toISOString(), status: 'active',
      createdAt: weekAgo.toISOString(), updatedAt: weekAgo.toISOString(),
    },
    {
      id: 'prj_4', title: 'Q1 Marketing', description: 'Marketing campaign planning and execution for Q1.',
      memberIds: ['usr_1', 'usr_4', 'usr_5'], ownerId: 'usr_5',
      dueDate: new Date(now.getTime() + 45 * 86400000).toISOString(), status: 'active',
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
  ];

  const tasks: Task[] = [
    {
      id: 'tsk_1', title: 'Design system documentation', description: 'Document all components and usage guidelines.',
      assigneeId: 'usr_2', projectId: 'prj_1', status: 'completed', priority: 'high',
      dueDate: new Date(now.getTime() + 5 * 86400000).toISOString(),
      comments: [{ id: 'cmt_1', content: 'Draft ready for review', authorId: 'usr_2', createdAt: weekAgo.toISOString() }],
      createdAt: twoWeeksAgo.toISOString(), createdById: 'usr_1',
    },
    {
      id: 'tsk_2', title: 'Navigation component', description: 'Build responsive navigation with mobile support.',
      assigneeId: 'usr_3', projectId: 'prj_1', status: 'in-progress', priority: 'high',
      dueDate: new Date(now.getTime() + 3 * 86400000).toISOString(), comments: [],
      createdAt: weekAgo.toISOString(), createdById: 'usr_1',
    },
    {
      id: 'tsk_3', title: 'CI/CD pipeline', description: 'Set up automated testing and deployment.',
      assigneeId: 'usr_1', projectId: 'prj_1', status: 'todo', priority: 'medium',
      dueDate: new Date(now.getTime() + 10 * 86400000).toISOString(), comments: [],
      createdAt: weekAgo.toISOString(), createdById: 'usr_1',
    },
    {
      id: 'tsk_4', title: 'Authentication flow', description: 'Implement OAuth and session management.',
      assigneeId: 'usr_3', projectId: 'prj_2', status: 'in-progress', priority: 'high',
      dueDate: new Date(now.getTime() + 7 * 86400000).toISOString(), comments: [],
      createdAt: weekAgo.toISOString(), createdById: 'usr_1',
    },
    {
      id: 'tsk_5', title: 'Push notifications', description: 'Integrate FCM for push notifications.',
      assigneeId: 'usr_4', projectId: 'prj_2', status: 'todo', priority: 'medium',
      dueDate: new Date(now.getTime() + 20 * 86400000).toISOString(), comments: [],
      createdAt: now.toISOString(), createdById: 'usr_1',
    },
    {
      id: 'tsk_6', title: 'Payment gateway', description: 'Stripe integration for payments.',
      assigneeId: 'usr_2', projectId: 'prj_3', status: 'in-progress', priority: 'high',
      dueDate: new Date(now.getTime() - 2 * 86400000).toISOString(), comments: [],
      createdAt: weekAgo.toISOString(), createdById: 'usr_5',
    },
    {
      id: 'tsk_7', title: 'Analytics dashboard', description: 'Build reporting endpoints.',
      assigneeId: 'usr_5', projectId: 'prj_3', status: 'todo', priority: 'medium',
      dueDate: new Date(now.getTime() + 8 * 86400000).toISOString(), comments: [],
      createdAt: now.toISOString(), createdById: 'usr_5',
    },
    {
      id: 'tsk_8', title: 'Content calendar', description: 'Plan social media content.',
      assigneeId: 'usr_4', projectId: 'prj_4', status: 'completed', priority: 'medium',
      dueDate: new Date(now.getTime() + 15 * 86400000).toISOString(), comments: [],
      createdAt: now.toISOString(), createdById: 'usr_5',
    },
    {
      id: 'tsk_9', title: 'Email templates', description: 'Design campaign email templates.',
      assigneeId: 'usr_1', projectId: 'prj_4', status: 'todo', priority: 'low',
      dueDate: new Date(now.getTime() + 25 * 86400000).toISOString(), comments: [],
      createdAt: now.toISOString(), createdById: 'usr_5',
    },
    {
      id: 'tsk_10', title: 'Database optimization', description: 'Add indexes and optimize queries.',
      assigneeId: 'usr_3', projectId: 'prj_1', status: 'todo', priority: 'low',
      dueDate: new Date(now.getTime() - 1 * 86400000).toISOString(), comments: [],
      createdAt: weekAgo.toISOString(), createdById: 'usr_1',
    },
    {
      id: 'tsk_11', title: 'Unit tests', description: 'Write tests for auth module.',
      assigneeId: 'usr_3', projectId: 'prj_2', status: 'todo', priority: 'medium',
      dueDate: new Date(now.getTime() + 12 * 86400000).toISOString(), comments: [],
      createdAt: now.toISOString(), createdById: 'usr_1',
    },
    {
      id: 'tsk_12', title: 'A/B testing setup', description: 'Configure landing page experiments.',
      assigneeId: 'usr_5', projectId: 'prj_4', status: 'in-progress', priority: 'high',
      dueDate: new Date(now.getTime() + 4 * 86400000).toISOString(), comments: [],
      createdAt: now.toISOString(), createdById: 'usr_5',
    },
  ];

  const activities: ActivityEvent[] = [
    { id: 'act_1', actorId: 'usr_1', action: 'created', resourceType: 'project', resourceId: 'prj_1', resourceName: 'Platform Redesign', createdAt: twoWeeksAgo.toISOString() },
    { id: 'act_2', actorId: 'usr_1', action: 'created', resourceType: 'task', resourceId: 'tsk_1', resourceName: 'Design system documentation', createdAt: twoWeeksAgo.toISOString() },
    { id: 'act_3', actorId: 'usr_2', action: 'completed', resourceType: 'task', resourceId: 'tsk_1', resourceName: 'Design system documentation', createdAt: weekAgo.toISOString() },
    { id: 'act_4', actorId: 'usr_1', action: 'created', resourceType: 'project', resourceId: 'prj_2', resourceName: 'Mobile App v2', createdAt: weekAgo.toISOString() },
    { id: 'act_5', actorId: 'usr_3', action: 'started', resourceType: 'task', resourceId: 'tsk_2', resourceName: 'Navigation component', createdAt: weekAgo.toISOString() },
    { id: 'act_6', actorId: 'usr_5', action: 'created', resourceType: 'project', resourceId: 'prj_3', resourceName: 'API Integration', createdAt: weekAgo.toISOString() },
    { id: 'act_7', actorId: 'usr_4', action: 'completed', resourceType: 'task', resourceId: 'tsk_8', resourceName: 'Content calendar', createdAt: now.toISOString() },
    { id: 'act_8', actorId: 'usr_5', action: 'created', resourceType: 'project', resourceId: 'prj_4', resourceName: 'Q1 Marketing', createdAt: now.toISOString() },
  ];

  storage.set(COLLECTIONS.users, users);
  storage.set(COLLECTIONS.projects, projects);
  storage.set(COLLECTIONS.tasks, tasks);
  storage.set(COLLECTIONS.activities, activities);
}

initializeDemoData();

// User operations
export const userService = {
  getAll(): User[] {
    return storage.get<User[]>(COLLECTIONS.users, []);
  },

  getById(id: string): User | undefined {
    return this.getAll().find(u => u.id === id);
  },

  getByEmail(email: string): User | undefined {
    return this.getAll().find(u => u.email === email);
  },

  create(data: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getAll();
    const user: User = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    storage.set(COLLECTIONS.users, [...users, user]);
    return user;
  },

  update(id: string, data: Partial<User>): User | null {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...data };
    storage.set(COLLECTIONS.users, users);
    return users[index];
  },

  delete(id: string): boolean {
    const users = this.getAll().filter(u => u.id !== id);
    storage.set(COLLECTIONS.users, users);
    return true;
  },
};

// Project operations
export const projectService = {
  getAll(): Project[] {
    return storage.get<Project[]>(COLLECTIONS.projects, []);
  },

  getById(id: string): Project | undefined {
    return this.getAll().find(p => p.id === id);
  },

  getByMember(userId: string): Project[] {
    return this.getAll().filter(p => p.memberIds.includes(userId));
  },

  create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getAll();
    const timestamp = new Date().toISOString();
    const project: Project = {
      ...data,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    storage.set(COLLECTIONS.projects, [...projects, project]);
    activityService.log(data.ownerId, 'created', 'project', project.id, project.title);
    return project;
  },

  update(id: string, data: Partial<Project>): Project | null {
    const projects = this.getAll();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...data, updatedAt: new Date().toISOString() };
    storage.set(COLLECTIONS.projects, projects);
    return projects[index];
  },

  delete(id: string): boolean {
    const projects = this.getAll().filter(p => p.id !== id);
    storage.set(COLLECTIONS.projects, projects);
    // Cascade delete tasks
    const tasks = taskService.getAll().filter(t => t.projectId !== id);
    storage.set(COLLECTIONS.tasks, tasks);
    return true;
  },
};

// Task operations
export const taskService = {
  getAll(): Task[] {
    return storage.get<Task[]>(COLLECTIONS.tasks, []);
  },

  getById(id: string): Task | undefined {
    return this.getAll().find(t => t.id === id);
  },

  getByProject(projectId: string): Task[] {
    return this.getAll().filter(t => t.projectId === projectId);
  },

  getByAssignee(userId: string): Task[] {
    return this.getAll().filter(t => t.assigneeId === userId);
  },

  create(data: Omit<Task, 'id' | 'createdAt' | 'comments'>): Task {
    const tasks = this.getAll();
    const task: Task = {
      ...data,
      id: generateId(),
      comments: [],
      createdAt: new Date().toISOString(),
    };
    storage.set(COLLECTIONS.tasks, [...tasks, task]);
    activityService.log(data.createdById, 'created', 'task', task.id, task.title);
    return task;
  },

  update(id: string, data: Partial<Task>, actorId?: string): Task | null {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    const oldStatus = tasks[index].status;
    tasks[index] = { ...tasks[index], ...data };
    storage.set(COLLECTIONS.tasks, tasks);
    
    if (data.status && data.status !== oldStatus && actorId) {
      const action = data.status === 'completed' ? 'completed' : data.status === 'in-progress' ? 'started' : 'updated';
      activityService.log(actorId, action, 'task', id, tasks[index].title);
    }
    return tasks[index];
  },

  delete(id: string): boolean {
    const tasks = this.getAll().filter(t => t.id !== id);
    storage.set(COLLECTIONS.tasks, tasks);
    return true;
  },

  addComment(taskId: string, content: string, authorId: string): Task | null {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;
    
    const comment: TaskComment = {
      id: generateId(),
      content,
      authorId,
      createdAt: new Date().toISOString(),
    };
    tasks[index].comments.push(comment);
    storage.set(COLLECTIONS.tasks, tasks);
    return tasks[index];
  },
};

// Activity operations
export const activityService = {
  getAll(): ActivityEvent[] {
    return storage.get<ActivityEvent[]>(COLLECTIONS.activities, [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRecent(limit = 10): ActivityEvent[] {
    return this.getAll().slice(0, limit);
  },

  log(actorId: string, action: string, resourceType: ActivityEvent['resourceType'], resourceId: string, resourceName: string): void {
    const activities = storage.get<ActivityEvent[]>(COLLECTIONS.activities, []);
    activities.push({
      id: generateId(),
      actorId,
      action,
      resourceType,
      resourceId,
      resourceName,
      createdAt: new Date().toISOString(),
    });
    storage.set(COLLECTIONS.activities, activities);
  },
};

// Auth operations
export const authService = {
  getCurrentUser(): User | null {
    return storage.get<User | null>(COLLECTIONS.session, null);
  },

  login(email: string): User | null {
    const user = userService.getByEmail(email);
    if (user) {
      storage.set(COLLECTIONS.session, user);
      return user;
    }
    return null;
  },

  signup(name: string, email: string): User | null {
    if (userService.getByEmail(email)) return null;
    const user = userService.create({ name, email, role: 'member' });
    storage.set(COLLECTIONS.session, user);
    return user;
  },

  logout(): void {
    storage.remove(COLLECTIONS.session);
  },
};

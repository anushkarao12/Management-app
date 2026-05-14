import { useState, useMemo } from 'react';
import { Plus, Search, LayoutGrid, List, Calendar, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/auth';
import { useTasks } from '@/hooks/useWorkspace';
import { projectService, userService } from '@/services/database';
import { formatDate, isOverdue } from '@/lib/utils';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  projectId: z.string().min(1),
  assigneeId: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in-progress', 'completed']),
  dueDate: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const STATUS_COLS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Done' },
];

const PRIORITY_BADGE: Record<TaskPriority, 'secondary' | 'warning' | 'destructive'> = {
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
};

export function Tasks() {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [comment, setComment] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const { tasks, create, update, remove, addComment, getById } = useTasks({
    search,
    priority: priorityFilter,
    assigneeId: isAdmin ? undefined : user?.id,
  });

  const projects = useMemo(() => projectService.getAll(), []);
  const users = useMemo(() => userService.getAll(), []);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = (status: TaskStatus = 'todo') => {
    setEditId(null);
    reset({
      title: '', description: '', projectId: projects[0]?.id || '',
      assigneeId: user?.id || '', priority: 'medium', status,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEditTask = (id: string) => {
    const t = getById(id);
    if (!t) return;
    setEditId(id);
    setValue('title', t.title);
    setValue('description', t.description);
    setValue('projectId', t.projectId);
    setValue('assigneeId', t.assigneeId);
    setValue('priority', t.priority);
    setValue('status', t.status);
    setValue('dueDate', t.dueDate.split('T')[0]);
    setModalOpen(true);
  };
  
  // Use openEditTask to avoid lint error
  void openEditTask;

  const onSubmit = (data: FormData) => {
    if (editId) {
      update(editId, { ...data, dueDate: new Date(data.dueDate).toISOString() }, user?.id);
      toast.success('Task updated');
    } else {
      create({ ...data, dueDate: new Date(data.dueDate).toISOString(), createdById: user?.id || '' });
      toast.success('Task created');
    }
    setModalOpen(false);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedId) {
      update(draggedId, { status }, user?.id);
      setDraggedId(null);
      toast.success('Task moved');
    }
  };

  const handleAddComment = () => {
    if (!detailTask || !comment.trim() || !user) return;
    addComment(detailTask.id, comment, user.id);
    setComment('');
    setDetailTask(getById(detailTask.id) || null);
  };

  const renderTaskCard = (task: Task) => {
    const assignee = userService.getById(task.assigneeId);
    const project = projectService.getById(task.projectId);
    const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

    return (
      <div
        key={task.id}
        draggable
        onDragStart={() => setDraggedId(task.id)}
        onDragEnd={() => setDraggedId(null)}
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
          {overdue && <Badge variant="destructive">Overdue</Badge>}
        </div>

        <h4
          className="text-sm font-medium text-neutral-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600"
          onClick={() => setDetailTask(task)}
        >
          {task.title}
        </h4>
        <p className="text-xs text-neutral-500 line-clamp-2 mb-2">{task.description}</p>

        {project && <p className="text-xs text-neutral-400 mb-2">{project.title}</p>}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Calendar size={12} />
            <span className={overdue ? 'text-red-500' : ''}>{formatDate(task.dueDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            {task.comments.length > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-neutral-400">
                <MessageSquare size={12} /> {task.comments.length}
              </div>
            )}
            {assignee && <Avatar name={assignee.name} size="sm" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Tasks</h2>
          <p className="text-sm text-neutral-500">{tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden">
            <button onClick={() => setView('board')} className={`p-2 ${view === 'board' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}>
              <List size={16} />
            </button>
          </div>
          {isAdmin && (
            <Button onClick={() => openCreate()}>
              <Plus size={16} /> New
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2"
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3 min-h-[200px]"
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{col.label}</h3>
                  <span className="text-xs text-neutral-400 bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(renderTaskCard)}
                  {colTasks.length === 0 && (
                    <div className="text-center py-6 text-xs text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase p-3">Task</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase p-3 hidden md:table-cell">Project</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase p-3">Status</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase p-3 hidden sm:table-cell">Priority</th>
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase p-3 hidden lg:table-cell">Due</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const project = projectService.getById(task.projectId);
                  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
                  return (
                    <tr key={task.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="p-3">
                        <button onClick={() => setDetailTask(task)} className="text-sm font-medium text-neutral-900 dark:text-white hover:text-blue-600 text-left">
                          {task.title}
                        </button>
                      </td>
                      <td className="p-3 hidden md:table-cell text-sm text-neutral-500">{project?.title}</td>
                      <td className="p-3">
                        <select
                          value={task.status}
                          onChange={e => { update(task.id, { status: e.target.value as TaskStatus }, user?.id); }}
                          className="text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                        >
                          <option value="todo">Todo</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Done</option>
                        </select>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <Badge variant={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className={`text-sm ${overdue ? 'text-red-500' : 'text-neutral-500'}`}>{formatDate(task.dueDate)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title')} error={errors.title?.message} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
            <textarea {...register('description')} rows={2} className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Project</label>
              <select {...register('projectId')} className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Assignee</label>
              <select {...register('assigneeId')} className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Priority</label>
              <select {...register('priority')} className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Status</label>
              <select {...register('status')} className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Done</option>
              </select>
            </div>
            <Input type="date" label="Due" {...register('dueDate')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editId ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details">
        {detailTask && (() => {
          const assignee = userService.getById(detailTask.assigneeId);
          const project = projectService.getById(detailTask.projectId);
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{detailTask.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{detailTask.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-neutral-500">Status:</span> <Badge variant="secondary">{detailTask.status}</Badge></div>
                <div><span className="text-neutral-500">Priority:</span> <Badge variant={PRIORITY_BADGE[detailTask.priority]}>{detailTask.priority}</Badge></div>
                <div><span className="text-neutral-500">Due:</span> {formatDate(detailTask.dueDate)}</div>
                <div><span className="text-neutral-500">Project:</span> {project?.title}</div>
              </div>

              {assignee && (
                <div className="flex items-center gap-2 py-2">
                  <Avatar name={assignee.name} size="sm" />
                  <span className="text-sm">{assignee.name}</span>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-2">Comments ({detailTask.comments.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                  {detailTask.comments.map(c => {
                    const author = userService.getById(c.authorId);
                    return (
                      <div key={c.id} className="flex gap-2 text-sm">
                        {author && <Avatar name={author.name} size="sm" />}
                        <div>
                          <span className="font-medium">{author?.name}:</span> {c.content}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add comment..."
                    className="flex-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-sm"
                  />
                  <Button size="sm" onClick={handleAddComment}>Add</Button>
                </div>
              </div>

              {isAdmin && (
                <button onClick={() => { remove(detailTask.id); setDetailTask(null); toast.success('Deleted'); }} className="text-sm text-red-500 hover:text-red-600">
                  Delete task
                </button>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

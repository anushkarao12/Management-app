import { useState, useMemo } from 'react';
import { Plus, Search, Calendar, MessageSquare, LayoutGrid, List, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/auth';
import { useTasks } from '@/hooks/useWorkspace';
import { projectService, userService } from '@/services/database';
import { formatDate, isOverdue } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(3),
  projectId: z.string().min(1),
  assigneeId: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in-progress', 'completed']),
  dueDate: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const STATUS_COLS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-neutral-400' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-500' },
];

const PRIORITY_VARIANTS: Record<string, 'secondary' | 'warning' | 'destructive'> = {
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

  // FIX: This function was defined but never connected to any button click handler.
  // Now it is properly called from edit buttons in both board and list views.
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Badge variant={PRIORITY_VARIANTS[task.priority]}>{task.priority}</Badge>
            {overdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          {/* FIX: Added edit button to task cards in board view */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditTask(task.id);
            }}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>
        </div>

        <button
          className="text-sm font-medium text-neutral-900 dark:text-white text-left hover:text-blue-600 dark:hover:text-blue-400 mb-1 block"
          onClick={() => setDetailTask(task)}
        >
          {task.title}
        </button>
        <p className="text-xs text-neutral-500 mb-2 line-clamp-2">{task.description}</p>

        {project && <p className="text-xs text-neutral-400 mb-2">{project.title}</p>}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Calendar size={12} />
            {formatDate(task.dueDate)}
          </div>
          <div className="flex items-center gap-1.5">
            {task.comments.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-neutral-400">
                <MessageSquare size={12} /> {task.comments.length}
              </span>
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
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-md p-0.5">
            <button
              onClick={() => setView('board')}
              className={`p-1.5 rounded ${view === 'board' ? 'bg-white dark:bg-neutral-700 shadow-sm' : ''}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-white dark:bg-neutral-700 shadow-sm' : ''}`}
            >
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
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'low', 'medium', 'high'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 text-sm rounded-md ${priorityFilter === p ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
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
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-2 w-2 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{col.label}</h3>
                  <span className="text-xs text-neutral-400 ml-auto">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(renderTaskCard)}
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-md">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Task</th>
                <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Project</th>
                <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Priority</th>
                <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Due</th>
                <th className="text-left text-xs font-medium text-neutral-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => {
                const project = projectService.getById(task.projectId);
                const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
                return (
                  <tr key={task.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailTask(task)}
                        className="text-sm font-medium text-neutral-900 dark:text-white hover:text-blue-600"
                      >
                        {task.title}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{project?.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={PRIORITY_VARIANTS[task.priority]}>{task.priority}</Badge>
                    </td>
                    <td className={`px-4 py-3 text-sm ${overdue ? 'text-red-500' : 'text-neutral-500'}`}>
                      {formatDate(task.dueDate)}
                    </td>
                    {/* FIX: Added edit button in list view */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditTask(task.id)}
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
                        title="Edit task"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Project</label>
              <select
                {...register('projectId')}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Assignee</label>
              <select
                {...register('assigneeId')}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Priority</label>
              <select
                {...register('priority')}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <Input label="Due Date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details">
        {detailTask && (() => {
          const assignee = userService.getById(detailTask.assigneeId);
          const project = projectService.getById(detailTask.projectId);
          return (
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">{detailTask.title}</h3>
              <p className="text-sm text-neutral-500">{detailTask.description}</p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-neutral-400">Status:</span> <Badge variant={detailTask.status === 'completed' ? 'success' : 'secondary'}>{detailTask.status}</Badge></div>
                <div><span className="text-neutral-400">Priority:</span> <Badge variant={PRIORITY_VARIANTS[detailTask.priority]}>{detailTask.priority}</Badge></div>
                <div><span className="text-neutral-400">Due:</span> <span className="text-neutral-700 dark:text-neutral-300">{formatDate(detailTask.dueDate)}</span></div>
                <div><span className="text-neutral-400">Project:</span> <span className="text-neutral-700 dark:text-neutral-300">{project?.title}</span></div>
              </div>

              {assignee && (
                <div className="flex items-center gap-2">
                  <Avatar name={assignee.name} size="sm" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{assignee.name}</span>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">Comments ({detailTask.comments.length})</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {detailTask.comments.map(c => {
                    const author = userService.getById(c.authorId);
                    return (
                      <div key={c.id} className="flex items-start gap-2 text-sm">
                        {author && <Avatar name={author.name} size="sm" />}
                        <div>
                          <span className="font-medium text-neutral-900 dark:text-white">{author?.name}:</span>{' '}
                          <span className="text-neutral-600 dark:text-neutral-400">{c.content}</span>
                          <p className="text-xs text-neutral-400 mt-0.5">{formatDate(c.createdAt)}</p>
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
                  <Button size="sm" onClick={handleAddComment}>Send</Button>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      openEditTask(detailTask.id);
                      setDetailTask(null);
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      if (confirm('Delete this task?')) {
                        remove(detailTask.id);
                        setDetailTask(null);
                        toast.success('Task deleted');
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

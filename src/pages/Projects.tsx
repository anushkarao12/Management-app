import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Calendar } from 'lucide-react';
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
import { useProjects } from '@/hooks/useWorkspace';
import { taskService, userService } from '@/services/database';
import { formatDate, isOverdue } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(3),
  dueDate: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export function Projects() {
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const { projects, create, update, remove, getById } = useProjects({ search, status: statusFilter });
  const allUsers = userService.getAll();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditId(null);
    setSelectedMembers(user ? [user.id] : []);
    reset({ title: '', description: '', dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] });
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const p = getById(id);
    if (!p) return;
    setEditId(id);
    setSelectedMembers(p.memberIds);
    setValue('title', p.title);
    setValue('description', p.description);
    setValue('dueDate', p.dueDate.split('T')[0]);
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editId) {
      update(editId, { ...data, dueDate: new Date(data.dueDate).toISOString(), memberIds: selectedMembers });
      toast.success('Project updated');
    } else {
      create({
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        memberIds: selectedMembers,
        ownerId: user?.id || '',
        status: 'active',
      });
      toast.success('Project created');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this project?')) {
      remove(id);
      toast.success('Project deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Projects</h2>
          <p className="text-sm text-neutral-500">{projects.length} projects</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus size={16} /> New
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'active', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-md ${statusFilter === s ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p>No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const tasks = taskService.getByProject(project.id);
            const done = tasks.filter(t => t.status === 'completed').length;
            const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
            const members = project.memberIds.map(id => userService.getById(id)).filter(Boolean);
            const overdue = isOverdue(project.dueDate) && project.status !== 'completed';

            return (
              <Card key={project.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                      <Badge variant={project.status === 'active' ? 'secondary' : 'success'}>
                        {project.status}
                      </Badge>
                      {overdue && <Badge variant="destructive">Overdue</Badge>}
                    </div>
                    {isAdmin && (
                      <div className="relative">
                        <button
                          onClick={() => openEdit(project.id)}
                          className="p-1 text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="font-medium text-neutral-900 dark:text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4">{project.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>{done}/{tasks.length} tasks</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Calendar size={12} />
                      {formatDate(project.dueDate)}
                    </div>
                    <div className="flex -space-x-1.5">
                      {members.slice(0, 3).map(m => m && (
                        <Avatar key={m.id} name={m.name} size="sm" className="ring-2 ring-white dark:ring-neutral-900" />
                      ))}
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="mt-3 text-xs text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100"
                    >
                      Delete project
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" {...register('title')} error={errors.title?.message} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
            />
          </div>
          <Input type="date" label="Due Date" {...register('dueDate')} error={errors.dueDate?.message} />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Members</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {allUsers.map(u => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u.id)}
                    onChange={() => {
                      setSelectedMembers(prev =>
                        prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                      );
                    }}
                    className="rounded border-neutral-300"
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editId ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

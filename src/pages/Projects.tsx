import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Calendar, Edit2, Trash2 } from 'lucide-react';
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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
    setMenuOpenId(null);
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
      setMenuOpenId(null);
      toast.success('Project deleted');
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
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
                          onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                          className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal size={16} className="text-neutral-400" />
                        </button>
                        {menuOpenId === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-10">
                            <button
                              onClick={() => openEdit(project.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <h3 className="font-medium text-neutral-900 dark:text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{project.description}</p>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span>{done}/{tasks.length} tasks</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Calendar size={12} />
                      {formatDate(project.dueDate)}
                    </div>
                    <div className="flex -space-x-1.5">
                      {members.slice(0, 3).map(m => m && (
                        <Avatar key={m.id} name={m.name} size="sm" />
                      ))}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(project.id)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(project.id)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Project' : 'New Project'}>
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
          <Input label="Due Date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Members</label>
            <div className="flex flex-wrap gap-2">
              {allUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleMember(u.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedMembers.includes(u.id)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  <Avatar name={u.name} size="sm" className="h-5 w-5 text-[10px]" />
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">{editId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

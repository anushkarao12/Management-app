import { useState } from 'react';
import { Search, Shield, Mail, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/auth';
import { useTeam } from '@/hooks/useWorkspace';
import { taskService, projectService } from '@/services/database';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function Team() {
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { members, updateRole, remove } = useTeam({ search, role: roleFilter });

  const handleRoleChange = (userId: string, newRole: 'admin' | 'member') => {
    updateRole(userId, newRole);
    toast.success('Role updated');
  };

  const handleRemove = (userId: string) => {
    if (userId === user?.id) {
      toast.error("Can't remove yourself");
      return;
    }
    if (confirm('Remove this member?')) {
      remove(userId);
      toast.success('Member removed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Team</h2>
        <p className="text-sm text-neutral-500">{members.length} members</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'admin', 'member'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-sm rounded-md ${roleFilter === r ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => {
          const memberTasks = taskService.getByAssignee(member.id);
          const doneTasks = memberTasks.filter(t => t.status === 'completed').length;
          const memberProjects = projectService.getAll().filter(p => p.memberIds.includes(member.id));
          const isSelf = member.id === user?.id;

          return (
            <Card key={member.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={member.name} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">{member.name}</h3>
                      {isSelf && <Badge variant="secondary">You</Badge>}
                    </div>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' ? '👑 Admin' : 'Member'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-neutral-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    Joined {formatDate(member.createdAt)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">{memberProjects.length}</p>
                    <p className="text-xs text-neutral-500">Projects</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-white">{memberTasks.length}</p>
                    <p className="text-xs text-neutral-500">Tasks</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-emerald-600">{doneTasks}</p>
                    <p className="text-xs text-neutral-500">Done</p>
                  </div>
                </div>

                {isAdmin && !isSelf && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}
                      className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
                    >
                      <Shield size={12} />
                      Make {member.role === 'admin' ? 'member' : 'admin'}
                    </button>
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {members.length === 0 && (
        <div className="text-center py-12 text-neutral-400">No members found</div>
      )}
    </div>
  );
}

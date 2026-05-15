import { useMemo } from 'react';
import { FolderOpen, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/auth';
import { useWorkspaceStats, useActivity } from '@/hooks/useWorkspace';
import { projectService, taskService, userService } from '@/services/database';
import { formatDate, formatRelativeTime, isOverdue } from '@/lib/utils';

function StatCard({ label, value, icon: Icon, trend }: { label: string; value: number; icon: typeof FolderOpen; trend?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">{label}</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-white mt-1">{value}</p>
          </div>
          <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <Icon size={20} className="text-neutral-600 dark:text-neutral-400" />
          </div>
        </div>
        {trend && <p className="text-xs text-emerald-600 mt-2">{trend}</p>}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const stats = useWorkspaceStats(user?.id);
  const { activities } = useActivity(6);

  const chartData = useMemo(() => {
    const tasks = taskService.getAll();
    return {
      byPriority: [
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
      ],
      byStatus: [
        { name: 'Todo', value: stats.todo, color: '#94a3b8' },
        { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
        { name: 'Done', value: stats.completed, color: '#10b981' },
      ],
    };
  }, [stats]);

  const overdueItems = useMemo(() => {
    return taskService.getAll()
      .filter(t => t.status !== 'completed' && isOverdue(t.dueDate))
      .slice(0, 4);
  }, []);

  const projectProgress = useMemo(() => {
    return projectService.getAll().map(p => {
      const tasks = taskService.getByProject(p.id);
      const done = tasks.filter(t => t.status === 'completed').length;
      return { project: p, total: tasks.length, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
    }).slice(0, 4);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Projects" value={stats.totalProjects} icon={FolderOpen} />
        <StatCard label="Tasks" value={stats.totalTasks} icon={CheckCircle} />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertCircle} />
        <StatCard label="Completed" value={stats.completed} icon={TrendingUp} trend={`${stats.completionRate}% done`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Bar Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Tasks by Priority</h3>
          </CardHeader>
          <CardContent className="h-56 flex items-end gap-4 px-8 pb-4">
            {chartData.byPriority.map(item => {
              const maxVal = Math.max(...chartData.byPriority.map(i => i.value), 1);
              const heightPct = (item.value / maxVal) * 100;
              return (
                <div key={item.name} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-neutral-500">{item.value}</span>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-md relative" style={{ height: '150px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-blue-500 rounded-t-md transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-500">{item.name}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Status Donut */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Status Distribution</h3>
          </CardHeader>
          <CardContent className="h-56 flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  {(() => {
                    const total = chartData.byStatus.reduce((sum, s) => sum + s.value, 0) || 1;
                    let offset = 0;
                    return chartData.byStatus.map(s => {
                      const pct = (s.value / total) * 100;
                      const el = (
                        <circle
                          key={s.name}
                          cx="18" cy="18" r="15.9155"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="3"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset={`${-offset}`}
                        />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
              </div>
              <div className="space-y-2">
                {chartData.byStatus.map(s => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-neutral-600 dark:text-neutral-400">{s.name}</span>
                    <span className="font-medium text-neutral-900 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Project Progress</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectProgress.map(({ project, total, done, pct }) => (
              <div key={project.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{project.title}</span>
                  <span className="text-neutral-500">{done}/{total}</span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            {projectProgress.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4">No projects yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Overdue Tasks</h3>
              {overdueItems.length > 0 && <Badge variant="destructive">{overdueItems.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueItems.map(task => {
              const assignee = userService.getById(task.assigneeId);
              return (
                <div key={task.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {assignee && <Avatar name={assignee.name} size="sm" />}
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-red-500">Due {formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              );
            })}
            {overdueItems.length === 0 && (
              <p className="text-sm text-neutral-400 text-center py-4">No overdue tasks</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Recent Activity</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {activities.map(activity => {
            const actor = userService.getById(activity.actorId);
            return (
              <div key={activity.id} className="flex items-center gap-3 py-2">
                {actor && <Avatar name={actor.name} size="sm" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-900 dark:text-white">
                    <span className="font-medium">{actor?.name}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium">{activity.resourceName}</span>
                  </p>
                  <p className="text-xs text-neutral-400">{formatRelativeTime(activity.createdAt)}</p>
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-4">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { LayoutDashboard, FolderOpen, CheckCircle, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth';
import { Avatar } from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onToggle} />
      )}
      
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-60 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800',
        'flex flex-col transition-transform duration-200 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-base font-semibold text-neutral-900 dark:text-white">TaskFlow</span>
          <button onClick={onToggle} className="lg:hidden p-1 text-neutral-500 hover:text-neutral-700">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onToggle(); }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active 
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
                )}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          {user && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-neutral-500 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
    >
      <Menu size={20} />
    </button>
  );
}

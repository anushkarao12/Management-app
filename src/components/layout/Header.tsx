import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '@/context/theme';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <MobileMenuButton onClick={onMenuClick} />
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}

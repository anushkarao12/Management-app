import { cn } from '@/lib/utils';

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-violet-600',
  'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-orange-600',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const color = AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
  
  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium text-white shrink-0',
        color,
        sizes[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}

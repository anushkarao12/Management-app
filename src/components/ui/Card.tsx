import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-4 border-b border-neutral-200 dark:border-neutral-800', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LoadingProps {
  fullScreen?: boolean;
  className?: string;
}

export function Loading({ fullScreen, className }: LoadingProps) {
  const cn = twMerge(clsx("flex items-center justify-center text-muted-foreground", fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50", className));
  return (
    <div className={cn}>
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}

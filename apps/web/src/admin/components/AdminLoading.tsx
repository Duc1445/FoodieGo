import { Loader2 } from 'lucide-react';

interface AdminLoadingProps {
  text?: string;
}

export function AdminLoading({ text = 'Loading...' }: AdminLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 w-full text-muted-foreground gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}

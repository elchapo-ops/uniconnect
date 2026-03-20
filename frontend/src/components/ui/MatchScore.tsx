import { cn } from '@/lib/utils';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function MatchScore({ score, size = 'md', showLabel = false, className }: MatchScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success/15 text-success border-success/30';
    if (score >= 60) return 'bg-warning/15 text-warning border-warning/30';
    if (score > 0) return 'bg-destructive/15 text-destructive border-destructive/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-full border-2 flex items-center justify-center font-bold',
          getScoreColor(score),
          sizeClasses[size]
        )}
      >
        {score > 0 ? `${score}%` : 'N/A'}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">Match</span>
      )}
    </div>
  );
}

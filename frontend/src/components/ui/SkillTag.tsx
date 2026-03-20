import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SkillTagProps {
  skill: string;
  removable?: boolean;
  onRemove?: () => void;
  variant?: 'default' | 'primary' | 'outline';
  className?: string;
}

export function SkillTag({ skill, removable, onRemove, variant = 'default', className }: SkillTagProps) {
  const variantClasses = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary/10 text-primary',
    outline: 'border border-border bg-transparent text-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {skill}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:text-destructive transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

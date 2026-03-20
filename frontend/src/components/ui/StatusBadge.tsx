import { cn } from '@/lib/utils';

type Status =
  // Application statuses
  | 'applied' | 'under_review' | 'shortlisted' | 'interview_scheduled' | 'hired' | 'rejected' | 'withdrawn'
  // Legacy/other statuses
  | 'pending' | 'submitted' | 'accepted' | 'active' | 'closed' | 'draft' | 'verified' | 'unverified' | 'seeking' | 'interviewing' | 'placed';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  // Application statuses from backend
  applied: {
    label: 'Applied',
    className: 'bg-info/15 text-info border-info/30',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    className: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  },
  hired: {
    label: 'Hired',
    className: 'bg-success/15 text-success border-success/30',
  },
  withdrawn: {
    label: 'Withdrawn',
    className: 'bg-muted text-muted-foreground border-muted-foreground/30',
  },
  // Legacy statuses
  pending: {
    label: 'Pending',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-info/15 text-info border-info/30',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-success/15 text-success border-success/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/15 text-destructive border-destructive/30',
  },
  active: {
    label: 'Active',
    className: 'bg-success/15 text-success border-success/30',
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground border-muted-foreground/30',
  },
  draft: {
    label: 'Draft',
    className: 'bg-secondary text-secondary-foreground border-border',
  },
  verified: {
    label: 'Verified',
    className: 'bg-success/15 text-success border-success/30',
  },
  unverified: {
    label: 'Pending Verification',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  seeking: {
    label: 'Seeking',
    className: 'bg-info/15 text-info border-info/30',
  },
  interviewing: {
    label: 'Interviewing',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  placed: {
    label: 'Placed',
    className: 'bg-success/15 text-success border-success/30',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  // Fallback for unknown statuses
  if (!config) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
          'bg-muted text-muted-foreground border-muted-foreground/30',
          className
        )}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

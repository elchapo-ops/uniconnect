import { Calendar, Building2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MatchScore } from '@/components/ui/MatchScore';
import { Application } from '@/data/mockData';

interface ApplicationCardProps {
  application: Application;
  onApprove?: () => void;
  onReject?: () => void;
  showAutoApplyActions?: boolean;
}

export function ApplicationCard({ application, onApprove, onReject, showAutoApplyActions = false }: ApplicationCardProps) {
  const showActions = showAutoApplyActions && application.autoApplied && application.status === 'applied';

  // Safely format the date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground truncate">{application.jobTitle}</h4>
              <p className="text-sm text-muted-foreground">{application.company}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Applied {formatDate(application.appliedDate)}
                </span>
                {application.autoApplied && (
                  <span className="bg-info/10 text-info px-1.5 py-0.5 rounded text-xs">
                    Auto-applied
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {application.matchScore != null && <MatchScore score={application.matchScore} size="sm" />}
            <StatusBadge status={application.status} />
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={onReject}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              onClick={onApprove}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

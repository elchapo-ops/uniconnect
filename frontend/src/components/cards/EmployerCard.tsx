import { MapPin, Building2, Users, Briefcase, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Employer } from '@/data/mockData';

interface EmployerCardProps {
  employer: Employer;
  showActions?: boolean;
  onVerify?: () => void;
  onView?: () => void;
}

export function EmployerCard({ employer, showActions = true, onVerify, onView }: EmployerCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground truncate">{employer.companyName}</h4>
                {employer.verified && (
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{employer.industry}</p>
            </div>
          </div>
          <StatusBadge status={employer.verified ? 'verified' : 'unverified'} />
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {employer.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {employer.size} employees
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{employer.jobsPosted}</p>
            <p className="text-xs text-muted-foreground">Jobs Posted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{employer.hiredCount}</p>
            <p className="text-xs text-muted-foreground">Hired</p>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
              View Details
            </Button>
            {!employer.verified && (
              <Button size="sm" className="flex-1 bg-success hover:bg-success/90" onClick={onVerify}>
                Verify
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

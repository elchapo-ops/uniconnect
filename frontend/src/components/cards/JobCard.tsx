import { MapPin, Calendar, DollarSign, Briefcase, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MatchScore } from '@/components/ui/MatchScore';
import { SkillTag } from '@/components/ui/SkillTag';
import { Job } from '@/data/mockData';

interface JobCardProps {
  job: Job;
  showMatchScore?: boolean;
  showActions?: boolean;
  onApply?: () => void;
  onView?: () => void;
  isApplied?: boolean;
  isApplying?: boolean;
}

export function JobCard({ job, showMatchScore = true, showActions = true, onApply, onView, isApplied = false, isApplying = false }: JobCardProps) {
  const typeLabels = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    internship: 'Internship',
    contract: 'Contract',
  };

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>
          {showMatchScore && job.matchScore && (
            <MatchScore score={job.matchScore} size="sm" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" />
            {typeLabels[job.type]}
          </span>
          {job.salary && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <SkillTag key={skill} skill={skill} variant="primary" />
          ))}
          {job.skills.length > 4 && (
            <SkillTag skill={`+${job.skills.length - 4}`} variant="outline" />
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onView?.();
              }}
            >
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onApply?.();
              }}
              disabled={isApplied || isApplying}
            >
              {isApplying ? 'Applying...' : isApplied ? 'Applied' : 'Apply Now'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

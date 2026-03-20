import { useState } from 'react';
import { MapPin, GraduationCap, Calendar, X, Mail, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MatchScore } from '@/components/ui/MatchScore';
import { SkillTag } from '@/components/ui/SkillTag';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getFileUrl } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email?: string;
  fieldOfStudy?: string;
  university?: string;
  location?: string;
  availability?: string;
  skills: string[];
  bio?: string;
  resumeUrl?: string;
  matchScore?: number;
  placementStatus?: string;
}

interface StudentCardProps {
  student: Student;
  showActions?: boolean;
}

export function StudentCard({ student, showActions = true }: StudentCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const handleContact = () => {
    if (student.email) {
      window.open(`mailto:${student.email}`, '_blank');
    } else {
      setShowContact(true);
    }
  };

  return (
    <>
      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-foreground truncate">{student.name}</h4>
                <p className="text-sm text-muted-foreground">{student.fieldOfStudy || 'Student'}</p>
              </div>
            </div>
            {student.matchScore && <MatchScore score={student.matchScore} size="sm" />}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
            {student.university && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {student.university}
              </span>
            )}
            {student.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {student.location}
              </span>
            )}
            {student.availability && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {student.availability}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {student.skills?.slice(0, 4).map((skill) => (
              <SkillTag key={skill} skill={skill} variant="primary" />
            ))}
            {(student.skills?.length || 0) > 4 && (
              <SkillTag skill={`+${student.skills.length - 4}`} variant="outline" />
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            {student.placementStatus && <StatusBadge status={student.placementStatus} />}
            {showActions && (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>
                  View Profile
                </Button>
                <Button size="sm" onClick={handleContact}>
                  Contact
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{student.name}</h3>
                <p className="text-muted-foreground">{student.fieldOfStudy}</p>
                {student.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="w-4 h-4" />
                    {student.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {student.university && (
                <div>
                  <p className="font-medium">University</p>
                  <p className="text-muted-foreground">{student.university}</p>
                </div>
              )}
              {student.location && (
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{student.location}</p>
                </div>
              )}
              {student.availability && (
                <div>
                  <p className="font-medium">Availability</p>
                  <p className="text-muted-foreground">{student.availability}</p>
                </div>
              )}
              {student.placementStatus && (
                <div>
                  <p className="font-medium">Status</p>
                  <StatusBadge status={student.placementStatus} />
                </div>
              )}
            </div>

            {student.bio && (
              <div>
                <p className="font-medium mb-2">About</p>
                <p className="text-muted-foreground text-sm">{student.bio}</p>
              </div>
            )}

            <div>
              <p className="font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {student.skills?.map((skill) => (
                  <SkillTag key={skill} skill={skill} variant="primary" />
                ))}
                {(!student.skills || student.skills.length === 0) && (
                  <p className="text-sm text-muted-foreground">No skills listed</p>
                )}
              </div>
            </div>

            {student.resumeUrl && (
              <div>
                <p className="font-medium mb-2">Resume</p>
                <a
                  href={getFileUrl(student.resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  View Resume
                </a>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowProfile(false)}>Close</Button>
              <Button onClick={handleContact}>Contact Student</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal (fallback when no email) */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {student.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              This student's contact information is not available. They will be notified of your interest when you take action on their application.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowContact(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { LayoutDashboard, Building2, Briefcase, Users, FileText, Plus, MoreVertical, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkillTag } from '@/components/ui/SkillTag';
import { useEmployerJobs, useCreateJob } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employerApi } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/employer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Company Profile', href: '/employer/profile', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Job Postings', href: '/employer/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Candidates', href: '/employer/candidates', icon: <Users className="w-5 h-5" /> },
  { label: 'Applications', href: '/employer/applications', icon: <FileText className="w-5 h-5" /> },
];

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  skills: string[];
  status: string;
  applicantCount?: number;
}

function JobRow({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    const response = await employerApi.deleteJob(job.id);
    if (response.error) {
      toast({ title: 'Error', description: response.error, variant: 'destructive' });
    } else {
      toast({ title: 'Job deleted', description: 'The job has been removed.' });
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-foreground">{job.title}</h4>
            <p className="text-sm text-muted-foreground">{job.location} • {job.type}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 md:w-48">
        {job.skills.slice(0, 2).map((skill) => (
          <SkillTag key={skill} skill={skill} variant="outline" />
        ))}
        {job.skills.length > 2 && (
          <SkillTag skill={`+${job.skills.length - 2}`} variant="outline" />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-center">
          <p className="font-medium">{job.applicantCount || 0}</p>
          <p className="text-xs text-muted-foreground">Applicants</p>
        </div>
        <StatusBadge status={job.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              View Applications
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function EmployerJobs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: jobs, isLoading, refetch } = useEmployerJobs();
  const { createJob, isLoading: isCreating } = useCreateJob();
  const { toast } = useToast();

  const [newJob, setNewJob] = useState({
    title: '',
    type: 'internship',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    skills: '',
    deadline: '',
    status: 'active',
  });

  const jobsList = jobs || [];

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.description || !newJob.location) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const result = await createJob({
      ...newJob,
      type: newJob.type.replace('-', '_'),
      requirements: newJob.requirements.split('\n').filter(r => r.trim()),
      skills: newJob.skills.split(',').map(s => s.trim()).filter(s => s),
      deadline: newJob.deadline || undefined,
    });

    if (result.success) {
      toast({ title: 'Job Created', description: 'Your job has been posted successfully.' });
      setIsDialogOpen(false);
      setNewJob({ title: '', type: 'internship', location: '', salary: '', description: '', requirements: '', skills: '', deadline: '', status: 'active' });
      refetch();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Job Postings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Your Job Listings</h2>
            <p className="text-sm text-muted-foreground">Manage your job postings and view applicants</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Job Posting</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new job listing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title *</Label>
                    <Input
                      placeholder="e.g. Software Engineer Intern"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Type *</Label>
                    <Select value={newJob.type} onValueChange={(v) => setNewJob({ ...newJob, type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location *</Label>
                    <Input
                      placeholder="e.g. San Francisco, CA"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <Input
                      placeholder="e.g. $25-35/hr"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    placeholder="Describe the role and responsibilities..."
                    className="min-h-[100px]"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requirements (one per line)</Label>
                  <Textarea
                    placeholder="List the requirements..."
                    className="min-h-[80px]"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Required Skills (comma separated)</Label>
                  <Input
                    placeholder="e.g. React, Python, SQL"
                    value={newJob.skills}
                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Application Deadline</Label>
                  <Input
                    type="date"
                    value={newJob.deadline}
                    onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateJob} disabled={isCreating}>
                    {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Post Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {isLoading ? '-' : jobsList.filter(j => j.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {isLoading ? '-' : jobsList.filter(j => j.status === 'draft').length}
              </p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-muted-foreground">
                {isLoading ? '-' : jobsList.filter(j => j.status === 'closed').length}
              </p>
              <p className="text-sm text-muted-foreground">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <Card>
          <CardHeader>
            <CardTitle>All Postings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : jobsList.length > 0 ? (
              jobsList.map((job) => (
                <JobRow key={job.id} job={job} onRefresh={refetch} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No jobs posted yet</p>
                <p className="text-sm">Click "Post New Job" to create your first listing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

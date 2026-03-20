import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, Briefcase, Users, FileText, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentCard } from '@/components/cards/StudentCard';
import { useEmployerJobs, useCandidates } from '@/hooks/useApi';

const navItems = [
  { label: 'Dashboard', href: '/employer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Company Profile', href: '/employer/profile', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Job Postings', href: '/employer/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Candidates', href: '/employer/candidates', icon: <Users className="w-5 h-5" /> },
  { label: 'Applications', href: '/employer/applications', icon: <FileText className="w-5 h-5" /> },
];

export default function EmployerDashboard() {
  const { data: jobs, isLoading: jobsLoading } = useEmployerJobs();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();

  const jobsList = jobs || [];
  const candidatesList = candidates || [];

  const stats = {
    activeJobs: jobsList.filter(j => j.status === 'active').length,
    totalCandidates: candidatesList.length,
    totalApplications: jobsList.reduce((sum, j) => sum + (j.applicantCount || 0), 0),
    draftJobs: jobsList.filter(j => j.status === 'draft').length,
  };

  const isLoading = jobsLoading || candidatesLoading;

  return (
    <DashboardLayout navItems={navItems} title="Employer Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.activeJobs}</p>
                <p className="text-xs text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.totalCandidates}</p>
                <p className="text-xs text-muted-foreground">Matched Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.totalApplications}</p>
                <p className="text-xs text-muted-foreground">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.draftJobs}</p>
                <p className="text-xs text-muted-foreground">Draft Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Matched Candidates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Top Matched Candidates</CardTitle>
              <Link to="/employer/candidates">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : candidatesList.length > 0 ? (
                candidatesList.slice(0, 3).map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No candidates yet</p>
                  <p className="text-sm">Post a job to start matching with candidates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/employer/jobs">
                <Button className="w-full justify-start" variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
              <Link to="/employer/candidates">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Search Candidates
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Active Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : jobsList.filter(j => j.status === 'active').length > 0 ? (
                jobsList.filter(j => j.status === 'active').slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm">{job.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {job.applicantCount || 0} applicants
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>No active jobs</p>
                  <Link to="/employer/jobs" className="text-primary hover:underline">
                    Post your first job
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

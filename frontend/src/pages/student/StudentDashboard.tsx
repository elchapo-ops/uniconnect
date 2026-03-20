import { LayoutDashboard, User, Briefcase, FileText, Bell, Search, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobCard } from '@/components/cards/JobCard';
import { ApplicationCard } from '@/components/cards/ApplicationCard';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useJobs, useStudentApplications, useApplyToJob, useAcceptApplication, useWithdrawApplication } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
  { label: 'Job Search', href: '/student/jobs', icon: <Search className="w-5 h-5" /> },
  { label: 'Applications', href: '/student/applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Notifications', href: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
];

export default function StudentDashboard() {
  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useJobs();
  const { data: applications, isLoading: appsLoading, refetch: refetchApplications } = useStudentApplications();
  const { apply, isLoading: isApplying } = useApplyToJob();
  const { accept } = useAcceptApplication();
  const { withdraw } = useWithdrawApplication();
  const { toast } = useToast();
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [sortTab, setSortTab] = useState<string>('all');

  const handleAccept = async (id: string) => {
    const result = await accept(id);
    if (result.success) {
      toast({ title: "Application accepted!" });
      refetchApplications();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleWithdraw = async (id: string) => {
    const result = await withdraw(id);
    if (result.success) {
      toast({ title: "Application withdrawn" });
      refetchApplications();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const jobs = jobsData?.jobs || [];
  const appsList = applications || [];

  const pendingApplications = appsList.filter(a => a.status === 'applied');
  const stats = {
    matchedJobs: jobs.length,
    applied: appsList.length,
    accepted: appsList.filter(a => a.status === 'hired').length,
    pending: appsList.filter(a => ['applied', 'under_review', 'shortlisted', 'interview_scheduled'].includes(a.status)).length,
  };

  const isLoading = jobsLoading || appsLoading;

  // Derive Sorted Jobs based on tab
  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortTab === 'best_match') {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    if (sortTab === 'recent') {
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    }
    if (sortTab === 'deadline') {
      // Jobs without deadlines go to the bottom
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    // 'all' default sorting (could be whatever the API returned, which is usually recent)
    return 0;
  });

  const handleApply = async (jobId: string) => {
    const result = await apply(jobId);
    if (result.success) {
      setAppliedJobIds(prev => [...prev, jobId]);
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
      refetchApplications();
      refetchJobs();
    } else {
      toast({
        title: "Application failed",
        description: result.error || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Student Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.matchedJobs}</p>
                <p className="text-xs text-muted-foreground">Available Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.applied}</p>
                <p className="text-xs text-muted-foreground">Applied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.accepted}</p>
                <p className="text-xs text-muted-foreground">Hired</p>
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
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.pending}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingApplications.slice(0, 3).map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    showAutoApplyActions={true}
                    onApprove={() => handleAccept(application.id)}
                    onReject={() => handleWithdraw(application.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Job Listings with Sorting */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Available Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={sortTab} onValueChange={setSortTab} className="mb-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="best_match">Best Match</TabsTrigger>
                  <TabsTrigger value="recent">Most Recent</TabsTrigger>
                  <TabsTrigger value="deadline">Deadline</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedJobs.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {sortedJobs.slice(0, 6).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onApply={() => handleApply(job.id)}
                      isApplied={appliedJobIds.includes(job.id) || appsList.some(app => app.jobId === job.id)}
                      isApplying={isApplying}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No jobs available yet</p>
                  <p className="text-sm">Check back soon for new opportunities!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NotificationPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}

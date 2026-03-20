import { useState } from 'react';
import { LayoutDashboard, User, Search, FileText, Bell, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationCard } from '@/components/cards/ApplicationCard';
import { useStudentApplications, useAcceptApplication, useWithdrawApplication } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
  { label: 'Job Search', href: '/student/jobs', icon: <Search className="w-5 h-5" /> },
  { label: 'Applications', href: '/student/applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Notifications', href: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
];

// Map backend status to display-friendly status
const statusDisplayMap: Record<string, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export default function StudentApplications() {
  const [activeTab, setActiveTab] = useState('all');
  const { data: applications, isLoading, refetch } = useStudentApplications();
  const { accept } = useAcceptApplication();
  const { withdraw } = useWithdrawApplication();
  const { toast } = useToast();

  const handleAccept = async (id: string) => {
    const result = await accept(id);
    if (result.success) {
      toast({ title: "Application accepted!" });
      refetch();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleWithdraw = async (id: string) => {
    const result = await withdraw(id);
    if (result.success) {
      toast({ title: "Application withdrawn" });
      refetch();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const appsList = applications || [];

  const filteredApplications = activeTab === 'all'
    ? appsList
    : appsList.filter(a => {
      if (activeTab === 'in_progress') {
        return ['applied', 'under_review', 'shortlisted', 'interview_scheduled'].includes(a.status);
      }
      if (activeTab === 'hired') return a.status === 'hired';
      if (activeTab === 'rejected') return a.status === 'rejected';
      return true;
    });

  const counts = {
    all: appsList.length,
    in_progress: appsList.filter(a => ['applied', 'under_review', 'shortlisted', 'interview_scheduled'].includes(a.status)).length,
    hired: appsList.filter(a => a.status === 'hired').length,
    rejected: appsList.filter(a => a.status === 'rejected').length,
  };

  return (
    <DashboardLayout navItems={navItems} title="My Applications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{isLoading ? '-' : counts.all}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-warning">{isLoading ? '-' : counts.in_progress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{isLoading ? '-' : counts.hired}</p>
              <p className="text-sm text-muted-foreground">Hired</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{isLoading ? '-' : counts.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Application History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress ({counts.in_progress})</TabsTrigger>
                <TabsTrigger value="hired">Hired ({counts.hired})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={{
                        ...application,
                        // Transform status for display
                        statusDisplay: statusDisplayMap[application.status] || application.status,
                      }}
                      showAutoApplyActions={true}
                      onApprove={() => handleAccept(application.id)}
                      onReject={() => handleWithdraw(application.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No applications in this category</p>
                    <p className="text-sm">Start applying to jobs to see them here!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

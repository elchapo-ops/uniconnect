import { useState } from 'react';
import { LayoutDashboard, User, Search, FileText, Bell, Filter, Loader2, Briefcase } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JobCard } from '@/components/cards/JobCard';
import { useJobs, useStudentApplications, useApplyToJob } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
  { label: 'Job Search', href: '/student/jobs', icon: <Search className="w-5 h-5" /> },
  { label: 'Applications', href: '/student/applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Notifications', href: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
];

export default function StudentJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
  });
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  const { data, isLoading, refetch } = useJobs({
    search: searchQuery || undefined,
    location: filters.location && filters.location !== 'all' ? filters.location : undefined,
    type: filters.type && filters.type !== 'all' ? filters.type : undefined,
  });
  const { data: applications, refetch: refetchApplications } = useStudentApplications();
  const { apply, isLoading: isApplying } = useApplyToJob();
  const { toast } = useToast();

  const appsList = applications || [];

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const handleSearch = () => {
    refetch();
  };

  const handleApply = async (jobId: string) => {
    const result = await apply(jobId);
    if (result.success) {
      setAppliedJobIds(prev => [...prev, jobId]);
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
      refetchApplications();
      refetch();
    } else {
      toast({
        title: "Application failed",
        description: result.error || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Job Search">
      <div className="space-y-6">
        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={filters.location} onValueChange={(v) => setFilters({ ...filters, location: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any location</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="San Francisco">San Francisco</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Austin">Austin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Type</label>
                  <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button variant="outline" onClick={() => {
                    setFilters({ location: '', type: '' });
                    setSearchQuery('');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{pagination?.total || jobs.length}</span> jobs found
          </p>
          <Select defaultValue="match">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
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
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No jobs found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination info */}
        {pagination && pagination.totalPages > 1 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

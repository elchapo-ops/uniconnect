import { useState } from 'react';
import { LayoutDashboard, Users, Building2, Briefcase, LineChart, Search, MoreVertical, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAdminEmployers } from '@/hooks/useApi';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Employers', href: '/admin/employers', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Jobs', href: '/admin/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <LineChart className="w-5 h-5" /> },
];

interface Employer {
  id: string;
  companyName: string;
  email: string;
  industry?: string;
  location?: string;
  size?: string;
  verified: boolean;
  jobsPosted: number;
  hiredCount: number;
}

function EmployerRow({ employer, onRefresh }: { employer: Employer; onRefresh: () => void }) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (verified: boolean) => {
    setIsVerifying(true);
    const response = await adminApi.verifyEmployer(employer.id, verified);
    if (response.error) {
      toast({ title: 'Error', description: response.error, variant: 'destructive' });
    } else {
      toast({
        title: verified ? 'Employer Verified' : 'Verification Removed',
        description: `${employer.companyName} has been ${verified ? 'verified' : 'unverified'}.`
      });
      onRefresh();
    }
    setIsVerifying(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${employer.companyName}?`)) return;

    const response = await adminApi.deleteUser(employer.id);
    if (response.error) {
      toast({ title: 'Error', description: response.error, variant: 'destructive' });
    } else {
      toast({ title: 'Employer deleted', description: 'The employer has been removed.' });
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">{employer.companyName}</h4>
            {employer.verified && (
              <Badge variant="secondary" className="bg-success/10 text-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{employer.email}</p>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{employer.industry || 'N/A'}</p>
        <p className="text-sm text-muted-foreground">{employer.location || 'N/A'}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-sm text-center">
          <p className="font-medium">{employer.jobsPosted}</p>
          <p className="text-xs text-muted-foreground">Jobs</p>
        </div>
        <div className="text-sm text-center">
          <p className="font-medium">{employer.hiredCount}</p>
          <p className="text-xs text-muted-foreground">Hired</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isVerifying}>
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {employer.verified ? (
              <DropdownMenuItem onClick={() => handleVerify(false)}>
                <XCircle className="w-4 h-4 mr-2" />
                Remove Verification
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleVerify(true)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Employer
              </DropdownMenuItem>
            )}
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

export default function AdminEmployers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const { data, isLoading, error, refetch } = useAdminEmployers({
    search: searchQuery || undefined,
    verified: verifiedFilter && verifiedFilter !== 'all' ? verifiedFilter === 'true' : undefined,
  });

  const employers = data?.employers || [];
  const pagination = data?.pagination;

  if (error) {
    return (
      <DashboardLayout navItems={navItems} title="Manage Employers">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Manage Employers">
      <div className="space-y-6">
        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search employers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All employers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employers</SelectItem>
                  <SelectItem value="true">Verified only</SelectItem>
                  <SelectItem value="false">Unverified only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => refetch()}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Employers List */}
        <Card>
          <CardHeader>
            <CardTitle>All Employers ({pagination?.total || employers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : employers.length > 0 ? (
              employers.map((employer: Employer) => (
                <EmployerRow key={employer.id} employer={employer} onRefresh={refetch} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No employers found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

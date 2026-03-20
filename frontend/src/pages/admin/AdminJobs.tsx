import { useState } from 'react';
import { LayoutDashboard, Users, Building2, Briefcase, LineChart, Search, MoreVertical, Trash2, Loader2, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkillTag } from '@/components/ui/SkillTag';
import { useJobs } from '@/hooks/useApi';
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

interface Job {
    id: string;
    title: string;
    location: string;
    type: string;
    skills: string[];
    status: string;
    applicantCount?: number;
    employer?: {
        companyName: string;
    };
    createdAt: string;
}

function JobRow({ job }: { job: Job }) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate">{job.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                        {job.employer?.companyName || 'Unknown Company'}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{job.location}</p>
                <p className="text-sm text-muted-foreground">{job.type}</p>
            </div>

            <div className="flex flex-wrap gap-1 w-40">
                {job.skills?.slice(0, 2).map((skill) => (
                    <SkillTag key={skill} skill={skill} variant="outline" />
                ))}
                {(job.skills?.length || 0) > 2 && (
                    <SkillTag skill={`+${job.skills.length - 2}`} variant="outline" />
                )}
            </div>

            <div className="flex items-center gap-4">
                <StatusBadge status={job.status} />
                <div className="text-sm text-center">
                    <p className="font-medium">{job.applicantCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Applicants</p>
                </div>
                <div className="text-xs text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export default function AdminJobs() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading, error, refetch } = useJobs({
        search: searchQuery || undefined,
    });

    const jobs = data?.jobs || [];
    const pagination = data?.pagination;

    // Filter by status client-side
    const filteredJobs = statusFilter && statusFilter !== 'all'
        ? jobs.filter((j: Job) => j.status === statusFilter)
        : jobs;

    if (error) {
        return (
            <DashboardLayout navItems={navItems} title="Manage Jobs">
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
        <DashboardLayout navItems={navItems} title="Manage Jobs">
            <div className="space-y-6">
                {/* Search & Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search jobs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => refetch()}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{isLoading ? '-' : jobs.length}</p>
                            <p className="text-sm text-muted-foreground">Total Jobs</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-success">{isLoading ? '-' : jobs.filter((j: Job) => j.status === 'active').length}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-muted-foreground">{isLoading ? '-' : jobs.filter((j: Job) => j.status === 'closed').length}</p>
                            <p className="text-sm text-muted-foreground">Closed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Jobs List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Jobs ({pagination?.total || filteredJobs.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredJobs.length > 0 ? (
                            filteredJobs.map((job: Job) => (
                                <JobRow key={job.id} job={job} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No jobs found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

import { useState } from 'react';
import { LayoutDashboard, Building2, Briefcase, Users, FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkillTag } from '@/components/ui/SkillTag';
import { useEmployerJobs } from '@/hooks/useApi';
import { employerApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getFileUrl } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

const navItems = [
    { label: 'Dashboard', href: '/employer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Company Profile', href: '/employer/profile', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Job Postings', href: '/employer/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Candidates', href: '/employer/candidates', icon: <Users className="w-5 h-5" /> },
    { label: 'Applications', href: '/employer/applications', icon: <FileText className="w-5 h-5" /> },
];

const statusOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
];

interface Application {
    id: string;
    status: string;
    appliedAt: string;
    student: {
        id: string;
        name: string;
        email: string;
        skills: string[];
        university?: string;
        fieldOfStudy?: string;
        resumeUrl?: string;
    };
}

interface Job {
    id: string;
    title: string;
    location: string;
    status: string;
    applicantCount?: number;
}

function ApplicationRow({
    application,
    onStatusChange
}: {
    application: Application;
    onStatusChange: (id: string, status: string) => void;
}) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        await onStatusChange(application.id, newStatus);
        setIsUpdating(false);
    };

    const handleContact = () => {
        if (application.student.email) {
            window.location.href = `mailto:${application.student.email}`;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-medium text-primary">
                        {application.student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                </div>
                <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate">{application.student.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{application.student.email}</p>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{application.student.fieldOfStudy || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{application.student.university || 'N/A'}</p>
            </div>

            <div className="flex flex-wrap gap-1 w-40">
                {application.student.skills?.slice(0, 2).map((skill) => (
                    <SkillTag key={skill} skill={skill} variant="outline" />
                ))}
                {(application.student.skills?.length || 0) > 2 && (
                    <SkillTag skill={`+${application.student.skills.length - 2}`} variant="outline" />
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex gap-2 mr-4">
                    {application.student.resumeUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={getFileUrl(application.student.resumeUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Resume
                            </a>
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleContact}>
                        Contact
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                </div>
                <Select
                    value={application.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

function JobApplicationsSection({ job, onRefresh }: { job: Job; onRefresh: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const loadApplications = async () => {
        if (applications.length > 0) return; // Already loaded

        setIsLoading(true);
        const response = await employerApi.getJobApplications(job.id);
        if (response.data) {
            setApplications(response.data);
        }
        setIsLoading(false);
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            loadApplications();
        }
    };

    const handleStatusChange = async (applicationId: string, newStatus: string) => {
        const response = await employerApi.updateApplicationStatus(applicationId, newStatus);
        if (response.error) {
            toast({ title: 'Error', description: response.error, variant: 'destructive' });
        } else {
            toast({ title: 'Status Updated', description: 'Application status has been updated.' });
            // Update local state
            setApplications(apps =>
                apps.map(app => app.id === applicationId ? { ...app, status: newStatus } : app)
            );
            onRefresh();
        }
    };

    return (
        <Collapsible open={isOpen} onOpenChange={handleToggle}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{job.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{job.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={job.status} />
                                <span className="text-sm text-muted-foreground">
                                    {job.applicantCount || 0} applicants
                                </span>
                                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="border-t">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : applications.length > 0 ? (
                            <div className="space-y-3 pt-4">
                                {applications.map((application) => (
                                    <ApplicationRow
                                        key={application.id}
                                        application={application}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p>No applications for this job yet</p>
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default function EmployerApplications() {
    const { data: jobs, isLoading, refetch } = useEmployerJobs();
    const jobsList = jobs || [];

    const totalApplications = jobsList.reduce((sum, j) => sum + (j.applicantCount || 0), 0);
    const jobsWithApplicants = jobsList.filter(j => (j.applicantCount || 0) > 0);

    return (
        <DashboardLayout navItems={navItems} title="Applications">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-lg font-semibold">Manage Applications</h2>
                    <p className="text-sm text-muted-foreground">
                        Review and update application statuses for your job postings
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{isLoading ? '-' : totalApplications}</p>
                            <p className="text-sm text-muted-foreground">Total Applications</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-info">{isLoading ? '-' : jobsWithApplicants.length}</p>
                            <p className="text-sm text-muted-foreground">Jobs with Applicants</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-success">{isLoading ? '-' : jobsList.filter(j => j.status === 'active').length}</p>
                            <p className="text-sm text-muted-foreground">Active Jobs</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Job Applications */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : jobsList.length > 0 ? (
                    <div className="space-y-4">
                        {jobsList.map((job) => (
                            <JobApplicationsSection key={job.id} job={job} onRefresh={refetch} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No jobs posted yet</p>
                            <p className="text-sm">Post a job to start receiving applications</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}

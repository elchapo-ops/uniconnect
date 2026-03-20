import { useState } from 'react';
import { LayoutDashboard, Users, Building2, Briefcase, LineChart, Search, MoreVertical, Trash2, Loader2, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SkillTag } from '@/components/ui/SkillTag';
import { useAdminStudents } from '@/hooks/useApi';
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

interface Student {
  id: string;
  name: string;
  email: string;
  fieldOfStudy?: string;
  university?: string;
  skills: string[];
  placementStatus: string;
  applicationsCount?: number;
}

function StudentRow({ student, onRefresh }: { student: Student; onRefresh: () => void }) {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) return;

    const response = await adminApi.deleteUser(student.id);
    if (response.error) {
      toast({ title: 'Error', description: response.error, variant: 'destructive' });
    } else {
      toast({ title: 'Student deleted', description: 'The student has been removed.' });
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-foreground truncate">{student.name}</h4>
          <p className="text-sm text-muted-foreground truncate">{student.email}</p>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{student.fieldOfStudy || 'N/A'}</p>
        <p className="text-sm text-muted-foreground">{student.university || 'N/A'}</p>
      </div>

      <div className="flex flex-wrap gap-1 w-48">
        {student.skills?.slice(0, 2).map((skill) => (
          <SkillTag key={skill} skill={skill} variant="outline" />
        ))}
        {student.skills?.length > 2 && (
          <SkillTag skill={`+${student.skills.length - 2}`} variant="outline" />
        )}
      </div>

      <div className="flex items-center gap-4">
        <StatusBadge status={student.placementStatus} />
        <div className="text-sm text-center">
          <p className="font-medium">{student.applicationsCount || 0}</p>
          <p className="text-xs text-muted-foreground">Applications</p>
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

export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, error, refetch } = useAdminStudents({
    search: searchQuery || undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
  });

  const students = data?.students || [];
  const pagination = data?.pagination;

  if (error) {
    return (
      <DashboardLayout navItems={navItems} title="Manage Students">
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
    <DashboardLayout navItems={navItems} title="Manage Students">
      <div className="space-y-6">
        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
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
                  <SelectItem value="seeking">Seeking</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => refetch()}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>All Students ({pagination?.total || students.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : students.length > 0 ? (
              students.map((student: Student) => (
                <StudentRow key={student.id} student={student} onRefresh={refetch} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No students found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { LayoutDashboard, Building2, Briefcase, Users, FileText, Filter, Search, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudentCard } from '@/components/cards/StudentCard';
import { useCandidates } from '@/hooks/useApi';

const navItems = [
  { label: 'Dashboard', href: '/employer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Company Profile', href: '/employer/profile', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Job Postings', href: '/employer/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Candidates', href: '/employer/candidates', icon: <Users className="w-5 h-5" /> },
  { label: 'Applications', href: '/employer/applications', icon: <FileText className="w-5 h-5" /> },
];

export default function EmployerCandidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { data: candidates, isLoading } = useCandidates();

  const candidatesList = candidates || [];

  // Filter candidates based on search
  const filteredCandidates = candidatesList.filter(student => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.name?.toLowerCase().includes(query) ||
      student.fieldOfStudy?.toLowerCase().includes(query) ||
      student.skills?.some((s: string) => s.toLowerCase().includes(query))
    );
  });

  return (
    <DashboardLayout navItems={navItems} title="Candidates">
      <div className="space-y-6">
        {/* Search & Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name, skills, field of study..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field of Study</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any field</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="ds">Data Science</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="summer">Summer 2024</SelectItem>
                      <SelectItem value="fall">Fall 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Match Score</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any match" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any match</SelectItem>
                      <SelectItem value="80">80%+ Match</SelectItem>
                      <SelectItem value="60">60%+ Match</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredCandidates.length}</span> candidates found
          </p>
          <Select defaultValue="match">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best Match</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candidates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCandidates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No candidates found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

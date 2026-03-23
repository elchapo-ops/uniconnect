import { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Briefcase, Users, FileText, Mail, MapPin, Phone, Globe, Edit, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployerProfile, useEmployerJobs } from '@/hooks/useApi';
import { employerApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const navItems = [
    { label: 'Dashboard', href: '/employer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Company Profile', href: '/employer/profile', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Job Postings', href: '/employer/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Candidates', href: '/employer/candidates', icon: <Users className="w-5 h-5" /> },
    { label: 'Applications', href: '/employer/applications', icon: <FileText className="w-5 h-5" /> },
];

export default function EmployerProfile() {
    const { user } = useAuth();
    const { data: profile, isLoading, refetch } = useEmployerProfile();
    const { data: jobs } = useEmployerJobs();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        companyName: '',
        industry: '',
        size: '',
        location: '',
        website: '',
        description: '',
    });

    // Load profile into form
    useEffect(() => {
        if (profile) {
            setFormData({
                companyName: profile.companyName || '',
                industry: profile.industry || '',
                size: profile.size || '',
                location: profile.location || '',
                website: profile.website || '',
                description: profile.description || '',
            });
        }
    }, [profile]);

    const jobsList = jobs || [];
    const totalApplications = jobsList.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await employerApi.updateProfile(formData);
            if (response.error) {
                toast({ title: 'Error', description: response.error, variant: 'destructive' });
            } else {
                toast({ title: 'Profile Updated', description: 'Your company profile has been saved.' });
                setIsEditing(false);
                refetch();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout navItems={navItems} title="Company Profile">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Company Profile">
            <div className="space-y-6">
                {/* Header Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-2xl">{formData.companyName || 'Your Company'}</CardTitle>
                                        {profile?.verified && (
                                            <Badge variant="default" className="bg-success text-white">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-base mt-1">
                                        {formData.industry || 'Industry'} • {formData.size || 'Company Size'}
                                    </CardDescription>
                                </div>
                            </div>
                            <Button
                                variant={isEditing ? 'default' : 'outline'}
                                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : isEditing ? (
                                    'Save Changes'
                                ) : (
                                    <>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                {/* Company Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>Basic details about your company</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Input
                                    id="industry"
                                    placeholder="e.g. Technology, Finance, Healthcare"
                                    value={formData.industry}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="size">Company Size</Label>
                                <Input
                                    id="size"
                                    placeholder="e.g. 50-100 employees"
                                    value={formData.size}
                                    disabled={!isEditing}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="location"
                                        placeholder="e.g. San Francisco, CA"
                                        value={formData.location}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Company Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Tell candidates about your company..."
                                value={formData.description}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>How candidates can reach you</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="website"
                                        type="url"
                                        placeholder="https://yourcompany.com"
                                        value={formData.website}
                                        disabled={!isEditing}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hiring Statistics</CardTitle>
                        <CardDescription>Your performance on BICS</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-3xl font-bold text-primary">{jobsList.length}</p>
                                <p className="text-sm text-muted-foreground mt-1">Jobs Posted</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-3xl font-bold text-success">{jobsList.filter(j => j.status === 'active').length}</p>
                                <p className="text-sm text-muted-foreground mt-1">Active Jobs</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-3xl font-bold text-info">{totalApplications}</p>
                                <p className="text-sm text-muted-foreground mt-1">Applications</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-3xl font-bold text-warning">{profile?.verified ? 'Yes' : 'No'}</p>
                                <p className="text-sm text-muted-foreground mt-1">Verified</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

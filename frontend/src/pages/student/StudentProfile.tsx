import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, User, Search, FileText, Bell, Upload, Plus, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkillTag } from '@/components/ui/SkillTag';
import { useToast } from '@/hooks/use-toast';
import { useStudentProfile } from '@/hooks/useApi';
import { studentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
  { label: 'Job Search', href: '/student/jobs', icon: <Search className="w-5 h-5" /> },
  { label: 'Applications', href: '/student/applications', icon: <FileText className="w-5 h-5" /> },
  { label: 'Notifications', href: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
];

import { getFileUrl } from '@/lib/utils';

export default function StudentProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, isLoading, refetch } = useStudentProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    university: '',
    fieldOfStudy: '',
    location: '',
    availability: '',
    bio: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        university: profile.university || '',
        fieldOfStudy: profile.fieldOfStudy || '',
        location: profile.location || '',
        availability: profile.availability || '',
        bio: profile.bio || '',
      });
      setSkills(profile.skills || []);
    }
  }, [profile]);

  // Show loading while fetching profile
  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} title="My Profile">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // Show message if profile not found
  if (!profile) {
    return (
      <DashboardLayout navItems={navItems} title="My Profile">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const addSkill = () => {
    if (!newSkill) return;

    const skillsToAdd = newSkill
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !skills.includes(s));

    if (skillsToAdd.length > 0) {
      // Filter out duplicates within the new input itself if any
      const uniqueNewSkills = [...new Set(skillsToAdd)];
      setSkills([...skills, ...uniqueNewSkills]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await studentApi.updateProfile({
        ...formData,
        skills,
      });

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been saved successfully.',
        });
        refetch();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { data, error } = await studentApi.uploadResume(file);

      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (data) {
        toast({ title: 'Success', description: 'Resume uploaded successfully' });
        // Update local resumeUrl state if available or refetch
        refetch(); // Simplest way to ensure consistency
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to upload resume', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    try {
      setIsUploading(true);
      const { data, error } = await studentApi.uploadAvatar(file);

      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (data) {
        toast({ title: 'Success', description: 'Profile photo updated' });
        // Refresh profile data to show new avatar
        const profileRes = await studentApi.getProfile();
        if (profileRes.data) {
          // Ideally we should update the auth context user too, but a page refresh will do for now
          // For immediate feedback we might want to reload the page or update local state if we had it
          window.location.reload();
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to upload photo', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={getFileUrl(profile.avatarUrl)!} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell employers about yourself..."
                className="min-h-[100px]"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>Your educational background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add skills that match your expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <SkillTag
                  key={skill}
                  skill={skill}
                  variant="primary"
                  removable
                  onRemove={() => removeSkill(skill)}
                />
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground">No skills added yet. Add some to improve job matching!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Job Preferences</CardTitle>
            <CardDescription>Set your availability and location preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Summer 2024"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Upload your resume (PDF or DOC)</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleResumeUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            {profile?.resumeUrl ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium">Resume uploaded</p>
                    <p className="text-sm text-muted-foreground">Click to replace</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Replace'}
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="w-10 h-10 text-muted-foreground mx-auto mb-4 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                )}
                <p className="text-sm text-muted-foreground mb-2">
                  {isUploading ? 'Uploading...' : 'Click to upload your resume'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => refetch()}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

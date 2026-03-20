import { LayoutDashboard, User, Search, FileText, Bell, Loader2, CheckCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useApi';
import { notificationsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const navItems = [
    { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" /> },
    { label: 'Job Search', href: '/student/jobs', icon: <Search className="w-5 h-5" /> },
    { label: 'Applications', href: '/student/applications', icon: <FileText className="w-5 h-5" /> },
    { label: 'Notifications', href: '/student/notifications', icon: <Bell className="w-5 h-5" /> },
];

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

const typeLabels: Record<string, string> = {
    job_match: 'Job Match',
    application_update: 'Application Update',
    application: 'Application',
    system: 'System',
};

const typeColors: Record<string, string> = {
    job_match: 'bg-success/10 text-success',
    application_update: 'bg-info/10 text-info',
    application: 'bg-warning/10 text-warning',
    system: 'bg-muted text-muted-foreground',
};

export default function StudentNotifications() {
    const { data: notifications, isLoading, refetch } = useNotifications();
    const { toast } = useToast();
    const notificationsList = notifications || [];
    const unreadCount = notificationsList.filter((n: Notification) => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        await notificationsApi.markAsRead(id);
        refetch();
    };

    const handleMarkAllRead = async () => {
        await notificationsApi.markAllAsRead();
        toast({
            title: 'All notifications marked as read',
        });
        refetch();
    };

    return (
        <DashboardLayout navItems={navItems} title="Notifications">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Your Notifications</h2>
                        <p className="text-sm text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={handleMarkAllRead}>
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Mark All as Read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : notificationsList.length > 0 ? (
                            notificationsList.map((notification: Notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        'flex gap-4 p-4 rounded-lg border border-border transition-colors cursor-pointer hover:bg-muted/50',
                                        !notification.read && 'bg-primary/5 border-primary/20'
                                    )}
                                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                                typeColors[notification.type] || typeColors.system
                                            )}>
                                                {typeLabels[notification.type] || 'Notification'}
                                            </span>
                                            {!notification.read && (
                                                <span className="w-2 h-2 bg-primary rounded-full" />
                                            )}
                                        </div>
                                        <h4 className="font-medium text-foreground">{notification.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No notifications yet</p>
                                <p className="text-sm">We'll notify you about job matches and application updates</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

import { Bell, Briefcase, CheckCircle, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useApi';
import { notificationsApi } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const iconMap: Record<string, any> = {
  job_match: Briefcase,
  application_update: CheckCircle,
  application: Info,
  system: Bell,
};

const colorMap: Record<string, string> = {
  job_match: 'text-success bg-success/10',
  application_update: 'text-info bg-info/10',
  application: 'text-warning bg-warning/10',
  system: 'text-muted-foreground bg-muted',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: () => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = iconMap[notification.type] || Bell;
  const color = colorMap[notification.type] || colorMap.system;

  const handleClick = async () => {
    if (!notification.read) {
      await notificationsApi.markAsRead(notification.id);
      onMarkRead?.();
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-muted/50',
        !notification.read && 'bg-primary/5'
      )}
      onClick={handleClick}
    >
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
          {!notification.read && (
            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const { data: notifications, isLoading, refetch } = useNotifications();
  const notificationsList = notifications || [];
  const unreadCount = notificationsList.filter((n: Notification) => !n.read).length;

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    refetch();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : notificationsList.length > 0 ? (
          notificationsList.slice(0, 5).map((notification: Notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={refetch}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

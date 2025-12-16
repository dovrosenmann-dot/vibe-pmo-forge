import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction_approved':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'transaction_rejected':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notification.read_at && "bg-muted/30"
                  )}
                  onClick={() => {
                    if (!notification.read_at) {
                      markAsRead.mutate(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-2">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.read_at && (
                          <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

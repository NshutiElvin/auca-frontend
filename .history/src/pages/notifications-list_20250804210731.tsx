import { formatDistanceToNow } from "date-fns"
import { Check, X } from "lucide-react"
import { Button } from "../components/ui/button"
import type { NotificationData } from "../contexts/NotificationContext"

interface NotificationListProps {
  notifications: NotificationData[]
  onNotificationClick?: (id: number) => void
}

export function NotificationList({ notifications, onNotificationClick }: NotificationListProps) {

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/mark_as_read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true })
      })
      
      if (response.ok && onNotificationClick) {
        onNotificationClick(id)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const dismissNotification = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/`, {
        method: 'DELETE'
      })
      
      if (onNotificationClick) {
        onNotificationClick(id)
      }
    } catch (error) {
      console.error("Error dismissing notification:", error)
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No notifications available
      </div>
    )
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {notifications.reverse().map((notification) => (
        <div
          key={notification.id}
          className={`border-b p-4 ${!notification.is_read ? 'bg-blue-50' : ''}`}
          onClick={() => markAsRead(notification.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="ml-2 flex space-x-1">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    markAsRead(notification.id)
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  dismissNotification(notification.id)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
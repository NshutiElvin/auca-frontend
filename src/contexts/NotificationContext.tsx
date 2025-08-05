import { createContext, useState, useCallback } from "react";
import type { PropsWithChildren } from "react";

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

interface NotificationContextType {
  notifications: NotificationData[];
  setNotifications: (data: NotificationData[] | ((prev: NotificationData[]) => NotificationData[])) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  setNotifications: () => {},
  clearNotifications: () => {},
});

export const NotificationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [notifications, setNotificationsData] = useState<NotificationData[]>([]);
 
  const clearNotifications = useCallback(() => {
    setNotificationsData([]);
  }, []);

  const setNotifications = useCallback(
    (data: NotificationData[] | ((prev: NotificationData[]) => NotificationData[])) => {
      if (typeof data === 'function') {
        setNotificationsData(data);
      } else {
        setNotificationsData(data);
      }
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
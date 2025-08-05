import { createContext, useState } from "react";
import type { PropsWithChildren } from "react";
import useAuth from "../hooks/useAuth";

interface NotificationData {
  [key: string]: any;
}

interface NotificationContextType {
  notifications: NotificationData[];
  setNotifications: (data: NotificationData) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  setNotifications: () => {},
  clearNotifications: () => {},
   
});

export const NotificationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [notifications,  setNotificationsData] = useState<NotificationData[]>([]);
 
  const clearNotifications = () => {
    setNotificationsData([]);
  };
   const setNotifications = (data: NotificationData) => {
    setNotificationsData((prev) => {
      const isDuplicate = prev.some(
        (msg) => JSON.stringify(msg) === JSON.stringify(data)
      );
      return isDuplicate ? prev : [...prev, data];
    });
  };


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


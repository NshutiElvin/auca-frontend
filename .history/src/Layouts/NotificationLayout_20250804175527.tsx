import { useEffect } from "react";
import { Outlet } from "react-router";
import useSocket from "../hooks/useSockets";
import useToast from "../hooks/useToast";

export interface NotificationData {
  id: string;
  message: string;
  message_type: "success" | "info" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark";
}

function NotificationLayout() {
  const { setToastMessage } = useToast();
  const {connectWebSocket} = useSocket();

  useEffect(() => {
    const socket=connectWebSocket("/notification/");
    socket.onmessage = (event: MessageEvent) => {
      try {
        const notification: NotificationData = JSON.parse(event.data);

        if (notification.message) {
          setToastMessage({
            message: notification.message || "New message received",
            variant:notification.message_type ,
            
          });

        }
      } catch (e) {
        setToastMessage({
            message: "Invalid notification",
            variant:"danger" ,
            
          });
      }
    };

    return () => {
      socket?.close();  
    };
  }, []);

  return <Outlet />;
}

export default NotificationLayout;

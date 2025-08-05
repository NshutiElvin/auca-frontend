import { useEffect } from "react";
import { Outlet } from "react-router";
import useSocket from "../hooks/useSockets";
import useToast from "../hooks/useToast";
import useNotifications from "../hooks/useNotifications";

export interface NotificationData {
  id: string;
  message: string;
}

function NotificationLayout() {
  const { setToastMessage } = useToast();
  const {connectWebSocket} = useSocket();
  const{setNotifications}= useNotifications()
  

  useEffect(() => {
    const socket=connectWebSocket("/ws/notifications/");
    socket.onmessage = (event: MessageEvent) => {
      try {
        const notification: NotificationData = JSON.parse(event.data);

        if (notification.message) {
          setToastMessage({
            message: notification.message || "New message received",
            variant:"info" ,
            
          });
          setNotifications((prev:any)=>{
            return {...prev, notification}
          })

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

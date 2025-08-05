import { useEffect } from "react";
import { Outlet } from "react-router";
import useSocket from "../hooks/useSockets";
import useToast from "../hooks/useToast";
import useNotifications from "../hooks/useNotifications";
import useUserAxios from "../hooks/useUserAxios";
import type { NotificationData } from "../contexts/NotificationContext";
function NotificationLayout() {
  const { setToastMessage } = useToast();
  const {connectWebSocket} = useSocket();
  const{notifications,setNotifications}= useNotifications()
  const axios= useUserAxios()

    const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications/unread/");
      setNotifications(response.data);
      
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  

  useEffect(() => {
    const socket=connectWebSocket("/ws/notifications/");
    socket.onmessage = (event: MessageEvent) => {
      console.log(event)
      try {
        const notification: NotificationData = JSON.parse(event.data.message);

        if (notification.message) {
          setToastMessage({
            message: notification.message || "New message received",
            variant:"info" ,
            
          });
          setNotifications([...notifications, notification])

        }
      } catch (e) {
        console.log(e)
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
   useEffect(() => {
    fetchNotifications();
  }, []);

  return <Outlet />;
}

export default NotificationLayout;

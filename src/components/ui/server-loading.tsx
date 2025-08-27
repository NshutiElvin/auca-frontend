import { Loader2 } from "lucide-react";
import useToast from "../../hooks/useToast";
import { cn } from "../../lib/utils";
import useExamsSchedule from "../../hooks/useExamShedule";
import useNotifications from "../../hooks/useNotifications";
import { useState, useEffect } from "react";
import { NotificationData } from "../../contexts/NotificationContext";
function ServerLoader() {
  const { serverLoadingMessage, setServerLoadingMessage } = useToast();
  const { currentExamData } = useExamsSchedule();
  const [lastNotification, setLastNotification] = useState<NotificationData|null>(null);
  const{notifications,setNotifications}= useNotifications()
 useEffect(() => {
  
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  setLastNotification(sortedNotifications[0] || null);
  }, [notifications]);
  if (!serverLoadingMessage) return null;

  return (
    serverLoadingMessage?.message &&
    serverLoadingMessage.isServerLoading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 min-w-[320px] max-w-md mx-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            
            <div className="text-center">
               
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {serverLoadingMessage.message || "Loading..."}
              </p>
            </div>
          </div>
     
          {lastNotification && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{lastNotification?.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                { lastNotification.message}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default ServerLoader;
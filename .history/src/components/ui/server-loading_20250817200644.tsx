import { Loader2 } from "lucide-react";
import useToast from "../../hooks/useToast";
import { cn } from "../../lib/utils"; // Assuming you're using shadcn's utils

function ServerLoader() {
  const { serverLoadingMessage, setServerLoadingMessage } = useToast();

  if (!serverLoadingMessage) return null;

  return (
    serverLoadingMessage?.message &&
    serverLoadingMessage.isServerLoading && (
      <div className="fixed z-50 flex items-center gap-3 p-0 m-0 bg-transparent backdrop-blur-sm rounded-lg shadow-lg border min-h-[100vh] top-0 min-w-full">
        <div
          className={cn(
            "md:top-4 md:right-4 md:translate-x-0",
            "max-md:top-1/2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:-translate-y-1/2"
          )}
        >
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="text-sm font-medium">
            {serverLoadingMessage.message || "Loading..."}
          </div>
        </div>
      </div>
    )
  );
}

export default ServerLoader;

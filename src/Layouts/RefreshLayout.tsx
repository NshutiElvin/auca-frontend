import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";
import useToast from "../hooks/useToast";
import { Loader2 } from "lucide-react";

const RefreshLayout: React.FC = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const { auth } = useAuth();
  const { setToastMessage } = useToast();
  const refreshToken = useRefreshToken();

  const refresh = async (): Promise<void> => {
    try {
      await refreshToken();
    } catch (error: any) {
      setToastMessage({
        message: `Error: ${error?.message || "Invalid credentials"}`,
        variant: "danger",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      refresh();
    } else {
      setRefreshing(false);
    }
  }, [auth]);

  if (!refreshing) return <Outlet />;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="h-10 w-10 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          Loading…
        </p>
      </div>
    </div>
  );
};

export default RefreshLayout;
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";
import useToast from "../hooks/useToast";
import { Loader } from "lucide-react";

const RefreshLayout: React.FC = () => {
  const [refreshing, setRefreshing] = useState<boolean>(true);
  const { auth } = useAuth();
  const { setToastMessage } = useToast();
  const refreshToken = useRefreshToken();

  const refresh = async (): Promise<void> => {
    try {
      await refreshToken();
    } catch (error: any) {
      setToastMessage({message: `Error: ${error?.message||"Invalid credintials"}`, variant: "danger"});
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

  return     <>
      {refreshing ? (
        <center>
          <Loader className="animate-spin"/>
        </center>
      ) : (
        <Outlet />
      )}
    </>
};

export default RefreshLayout;

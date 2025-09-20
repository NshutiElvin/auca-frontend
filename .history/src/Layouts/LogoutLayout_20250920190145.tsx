import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import useUserAxios from "../hooks/useUserAxios";
import useToast from "../hooks/useToast";
import useAuth from "../hooks/useAuth";

const Logout: React.FC = () => {
  const axios = useUserAxios();
  const { setToastMessage } = useToast();
  const { setAuth } = useAuth();
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const logout = async () => {
    try {
      await axios.post("/api/users/logout/", {});
      setAuth(null);  
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setToastMessage({message:errorMessage, variant:"danger"});
    } finally {
      setIsLoggedOut(true);
        localStorage.removeItem('sidebarActivePath');
          localStorage.removeItem('sidebarActiveParentPath');
           localStorage.removeItem('sidebarActiveUrl');
    }
  };

  useEffect(() => {
    logout();
  }, []);

  return !isLoggedOut ? (
    <div className="flex justify-center items-center">
      <Loader className="animate-spin"/>  
    </div>
  ) : (
    <Navigate to="/" state={{ message: "Logged out" }}  />
  );
};

export default Logout;

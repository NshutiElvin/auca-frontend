import axios from "../API/axios";
import useAuth from "./useAuth";
import useToast from "./useToast";
import { AxiosError } from "axios";

interface RefreshResponse {
  access: string;
  permissions: any[];
}

interface ErrorResponse {
  message?: string;
  detail?: string;
  [key: string]: any;
}

const useRefreshToken = () => {
  const { setAuth, setPermissions, clearAuth } = useAuth();
  const { setToastMessage } = useToast();

  const refresh = async (): Promise<string | undefined> => {
    try {
      const resp = await axios.post<RefreshResponse>(
        "/api/users/token/refresh/",
        {},
        {
          withCredentials: true // Ensure cookies are sent
        }
      );
      const { access, permissions } = resp.data;
      setAuth(access);
      setPermissions(permissions);
      return access;
    } catch (error) {
      console.error("Refresh token error:", error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>;
        
        // Handle 401 specifically - token is invalid/expired
        if (axiosError.response?.status === 401) {
          clearAuth(); // Clear auth state on invalid refresh token
          setToastMessage({
            message: "Session expired. Please login again.",
            variant: "danger"
          });
        } else {
          // Handle other API errors
          const errorData = axiosError.response?.data;
          setToastMessage({
            message: errorData?.detail || errorData?.message || axiosError.message || "Authentication failed",
            variant: "danger"
          });
        }
      } else if (error instanceof Error) {
        setToastMessage({
          message: error.message,
          variant: "danger"
        });
      } else {
        setToastMessage({
          message: "An unexpected error occurred",
          variant: "danger"
        });
      }
      
      return undefined;
    }
  };

  return refresh;
};

export default useRefreshToken;
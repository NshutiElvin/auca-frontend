import axios from "../API/axios";
import useAuth from "./useAuth";
import useToast from "./useToast";
import { isAxiosError } from "axios";

interface RefreshResponse {
  access: string;
  permissions: any[];
}

interface ToastMessage {
  message: string;
  variant: "success" | "info" | "warning" | "danger";
}

const useRefreshToken = () => {
  const { setAuth, setPermissions } = useAuth();
  const { setToastMessage } = useToast();

  const refresh = async (): Promise<string | undefined> => {
    try {
      const resp = await axios.post<RefreshResponse>(
        "/api/users/token/refresh/",
        {}
      );
      const { access, permissions } = resp.data;
      setAuth(access);
      setPermissions(permissions);

      return resp.data.access;
    } catch (error) {
      if (isAxiosError(error)) {
        const toast: ToastMessage = {
          message:
            "Your session has expired or your account has been deactivated. Please log in again to continue. If the issue persists, contact support.",
          variant: "danger",
        };

        setToastMessage(toast);
      }
      return undefined;
    }
  };

  return refresh;
};

export default useRefreshToken;

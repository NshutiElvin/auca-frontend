import axios from "../API/axios";
import useAuth from "./useAuth";
import useToast from "./useToast";
import { AxiosError } from "axios";


interface RefreshResponse {
  access: string;
}

interface ToastMessage {
  message: string;
  variant: "success" | "info" | "warning" | "danger";
}

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const { setToastMessage } = useToast();

  const refresh = async (): Promise<string | undefined> => {
    try {
      const resp = await axios.post<RefreshResponse>("/api/users/token/refresh/", {});
      setAuth(resp.data.access);
      return resp.data.access;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;

      const toast: ToastMessage = {
        message: error.response?.data?.message || error.message || "Unknown error",
        variant: "danger",
      };

      setToastMessage(toast);
    }
  };

  return refresh;
};

export default useRefreshToken;

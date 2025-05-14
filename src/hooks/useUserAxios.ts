import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
import { userAxios } from "../API/axios";
import { useEffect } from "react";
import useToast from "./useToast";
function useUserAxios() {
  const { auth } = useAuth();
  const refreshToken = useRefreshToken();
  const{setToastMessage}= useToast()
  useEffect(() => {
    const requestInterceptor = userAxios.interceptors.request.use(
      function (config) {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${auth}`;
        }
        return config;
      },
      function (error) {
        return Promise.reject(error);
      }
    );
    const responseInterceptor = userAxios.interceptors.response.use(
      (response) => response,
      async function (error) {
        const prevRequest = error.config;
        if (error?.response?.status === 403 && !prevRequest.sent) {
          prevRequest.sent = true;
          const newAccessToken = await refreshToken();
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return userAxios(prevRequest);
        }
        return Promise.reject(error);
      }
    );
    return () => {
      userAxios.interceptors.request.eject(requestInterceptor);
      userAxios.interceptors.response.eject(responseInterceptor);
    };
  }, [auth]);
  return userAxios;
}

export default useUserAxios;

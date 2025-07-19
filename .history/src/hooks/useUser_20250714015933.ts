import { jwtDecode } from "jwt-decode";
import useAuth from "./useAuth";
import { DecodedToken } from "../../types";

function useUser() {
  const { auth } = useAuth();
  let user;
  try {
    user = jwtDecode<DecodedToken>(auth);
  } catch (error) {
    return {} as DecodedToken;
  }
  return user;
}

export default useUser;

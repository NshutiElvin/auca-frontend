import { jwtDecode } from "jwt-decode";
import useAuth from "./useAuth";

function useUser() {
  const { auth } = useAuth();
  let user;
  try {
    user = jwtDecode(auth);
  } catch (error) {
    return {};
  }
  return user;
}

export default useUser;

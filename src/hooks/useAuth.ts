import { useContext } from "react";
import userSessionContext, { AuthContextType } from "../contexts/userSessionContext";

const useAuth = (): AuthContextType => {
  const context = useContext(userSessionContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;

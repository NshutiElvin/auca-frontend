import { useContext } from "react";
import ErrorContext, { ErrorContextType } from "../contexts/ErrorContext";

function useError(): ErrorContextType {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorContextProvider");
  }
  return context;
}

export default useError;

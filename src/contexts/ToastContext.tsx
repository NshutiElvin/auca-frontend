import React, { createContext, useState, ReactNode } from "react";
import { useToast } from "../hooks/use-toast";

export interface ToastPayload {
  message: string;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'light' | 'dark';
}

export interface ToastContextType {
  toastMessage: ToastPayload | null;
  setToastMessage: (message: ToastPayload | null) => void;
  key: number
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastMessage, setToastMessageInner] = useState<ToastPayload | null>({message:"", variant:"success"});
  const[key, setKey]= useState<number>(0)
   const { toast } = useToast()

  const setToastMessage = (receivedMessage: ToastPayload | null) => {

     if (receivedMessage === null) {
        return null;
      }else{
           toast({
          description: receivedMessage.message,
          variant: receivedMessage.variant == "danger" ? "destructive" : "default"
          
        })
      }


    // setToastMessageInner((prev: ToastPayload | null) => {
    //   if (receivedMessage === null) {
    //     return null;
    //   }
    //   return {
    //     ...prev,
    //     message: receivedMessage.message,
    //     variant: receivedMessage.variant
    //   };
    // });
    // setKey((prev) => prev + 1);
  }


  return (
    <ToastContext.Provider value={{ toastMessage, setToastMessage, key }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;

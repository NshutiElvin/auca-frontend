import React, { createContext, useState, ReactNode } from "react";
import { useToast } from "../hooks/use-toast";

export interface ToastPayload {
  message: string;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'light' | 'dark';
}
export interface loadingMessage{
  message: string;
  isServerLoading: boolean;
}


export interface ToastContextType {
  toastMessage: ToastPayload | null;
  setToastMessage: (message: ToastPayload | null) => void;
  key: number;
  serverLoadingMessage?: loadingMessage | null;
  setServerLoadingMessage?: (message: loadingMessage | null) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastMessage, setToastMessageInner] = useState<ToastPayload | null>({message:"", variant:"success"});
  const[key, setKey]= useState<number>(0)
   const { toast } = useToast()
    const [serverLoadingMessage, setServerLoadingMessage] = useState<loadingMessage | null>(null);
  const setToastMessage = (receivedMessage: ToastPayload | null) => {

     if (receivedMessage === null) {
        return null;
      }else{
           toast({
          description: receivedMessage.message,
          variant: receivedMessage.variant == "danger" ? "destructive" : "default"
          
        })
      }


     
  }


  return (
    <ToastContext.Provider value={{ toastMessage, setToastMessage, key, serverLoadingMessage, setServerLoadingMessage }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;

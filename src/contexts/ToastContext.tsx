import React, { createContext, useState, ReactNode } from "react";

export interface ToastPayload {
  message: string;
  variant: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'light' | 'dark';
}

export interface ToastContextType {
  toastMessage: ToastPayload | null;
  setToastMessage: (message: ToastPayload | null) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<ToastPayload | null>(null);

  return (
    <ToastContext.Provider value={{ toastMessage, setToastMessage }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastContext;

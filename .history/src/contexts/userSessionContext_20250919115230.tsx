import React, { createContext, useState, ReactNode } from "react";

export interface AuthContextType {
  auth: any;  
  setAuth: (auth: any) => void; 
}

const userSessionContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<any>(null); 
  const[permissions, setPermissions]= useState<any[]>([])

  return (
    <userSessionContext.Provider value={{ auth, setAuth }}>
      {children}
    </userSessionContext.Provider>
  );
};

export default userSessionContext;

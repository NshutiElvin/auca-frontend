import { createContext, useState } from "react";
import type { PropsWithChildren } from "react";
import useAuth from "@/hooks/useAuth";

interface SocketData {
  [key: string]: any;
}

interface SocketContextType {
  newSocketData: SocketData[];
  setNewSocketData: (data: SocketData) => void;
  clearSocketData: () => void;
  connectWebSocket: (path: string) => WebSocket;
}

const SocketContext = createContext<SocketContextType>({
  newSocketData: [],
  setNewSocketData: () => {},
  clearSocketData: () => {},
  connectWebSocket: () => {
    throw new Error("connectWebSocket must be used within a SocketProvider");
  },
});

export const SocketProvider = ({ children }: PropsWithChildren<{}>) => {
  const [newSocketData, setSocketData] = useState<SocketData[]>([]);
  const { auth } = useAuth();
  const setNewSocketData = (data: SocketData) => {
    setSocketData((prev) => {
      const isDuplicate = prev.some(
        (msg) => JSON.stringify(msg) === JSON.stringify(data)
      );
      return isDuplicate ? prev : [...prev, data];
    });
  };

  const clearSocketData = () => {
    setSocketData([]);
  };

  const connectWebSocket = (path: string) => {
    

    const baseUrl = import.meta.env.VITE_SOCKET_URL.replace(/^http/, "ws");
    const socketUrl = `${baseUrl}${path}${auth ? `?token=${auth}` : ""}`;

    const ws = new WebSocket(socketUrl);
    return ws;
  }

  return (
    <SocketContext.Provider
      value={{
        newSocketData,
        setNewSocketData,
        clearSocketData,
        connectWebSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;


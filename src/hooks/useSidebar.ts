import { useContext } from "react";
import SidebarContext, { SidebarContextProps } from "../contexts/SidebarContext";



function useSidebarPath(): SidebarContextProps {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside sidebar context.");
  }
  return context;
}

export default useSidebarPath;

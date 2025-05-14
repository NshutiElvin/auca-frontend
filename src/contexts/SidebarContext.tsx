import React from "react";

 
  

 
export type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  parentUrl: string |null,
  url: string| null;
  setSidebarPath: (path: string) => void;
  setSidebarParentPath: (parent: string)=>void;
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

export default  SidebarContext;
 

import * as React from "react";
import { Check, ChevronsUpDown, GalleryVerticalEnd, Shield } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { DecodedToken } from "../../types";
import useToast from "../hooks/useToast";
import useNotifications from "../hooks/useNotifications";
import { jwtDecode } from "jwt-decode";
import { decode } from "punycode";

export function VersionSwitcher({
  versions,
  defaultVersion,
}: {
  versions: string[];
  defaultVersion: string;
}) {
  const { auth } = useAuth();
 
 
    const [decodedToken, setDecodedToken] = React.useState<DecodedToken | null>(null);
    const navigate = useNavigate();
    const { setToastMessage } = useToast();
    

  
    React.useEffect(() => {
      try {
        const decoded = jwtDecode<DecodedToken>(auth);
        setDecodedToken(decoded);
      } catch (error) {
        setToastMessage({
          message: "Error of validating access token. Please login again.",
          variant: "danger",
        });
        navigate("/login");
      }
    }, [auth]);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex flex-col items-start leading-none bg-white rounded-md">
                <motion.div
                  animate={{ y: [0, -5, 0] }}  
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Link
                    rel="noreferrer noopener"
                    to=""
                    className="text-lg font-semibold  transition-colors flex "
                  >
                     <img src="/logo.png"/>
                  </Link>
                </motion.div>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

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
} from "../components/ui/sidebar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function VersionSwitcher({
  versions,
  defaultVersion,
}: {
  versions: string[];
  defaultVersion: string;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex flex-col items-start leading-none">
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
                    className="text-lg font-semibold  transition-colors flex"
                  >
                    <Shield/>
                    Admin Portal
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

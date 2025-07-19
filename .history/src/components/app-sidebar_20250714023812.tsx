import * as React from "react"

import { VersionSwitcher } from "../components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../components/ui/sidebar"
import useSidebar from "../hooks/useSidebar"
import { Link } from "react-router-dom"

const data = {
  versions: ["1.0.1"],
  navMain: [
  
    {
      title: "Dashboard",
      url: "#",
      items: [
        {
          title: "Courses",
          url: "courses",
        },
      
        {
          title: "Allocations",
          url: "allocations",
        },
        {
          title: "Exams",
          url: "exams",
        },
        {
          title: "Schedules",
          url: "schedules",
        },
         {
          title: "Occupancies",
          url: "occupancies",
        },
      
        
      ],
    },
    {
      title: "Users",
      url: "#",
      items: [
        {
          title: "Admins",
          url: "#",
        },
        {
          title: "Students",
          url: "#",
        },
       
       
       
      ],
    },
    {
      title: "Authentication",
      url: "#",
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Logout",
          url: "/Logout",
        }
        
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {setSidebarPath, setSidebarParentPath, url} = useSidebar();
  const parent= data.navMain[0];
  const child= parent.items[0]
  React.useEffect(()=>{
    setSidebarParentPath(parent.title);
    setSidebarPath(child.title)

  }, [])
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((pItem) => (
          <SidebarGroup key={pItem.title}>
            <SidebarGroupLabel>{pItem.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pItem.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={url==item.title} onClick={()=>{
                      setSidebarPath(item.title)
                      setSidebarParentPath(pItem.title)
                    }}>
                      <Link to={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

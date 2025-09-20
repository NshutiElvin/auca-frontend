import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { VersionSwitcher } from "../components/version-switcher";
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
} from "../components/ui/sidebar";
import useSidebar from "../hooks/useSidebar";

// Define prop types
type SidebarItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type SidebarGroupType = {
  title: string;
  url: string;
  items: SidebarItem[];
};

type SidebarData = {
  versions: string[];
  navMain: SidebarGroupType[];
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  data: SidebarData;
};

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  const { setSidebarPath, setSidebarParentPath, url } = useSidebar();
  const location = useLocation();

  // Load saved state from localStorage on component mount
  React.useEffect(() => {
    const savedPath = localStorage.getItem('sidebarActivePath');
    const savedParentPath = localStorage.getItem('sidebarActiveParentPath');
    
    if (savedPath && savedParentPath) {
      // Verify that the saved paths still exist in the current data
      const parentGroup = data.navMain.find(group => group.title === savedParentPath);
      const childItem = parentGroup?.items.find(item => item.title === savedPath);
      
      if (parentGroup && childItem) {
        setSidebarPath(savedPath);
        setSidebarParentPath(savedParentPath);
        return;
      }
    }
    
    // Fallback to first item if no valid saved state
    if (data.navMain.length > 0 && data.navMain[0].items.length > 0) {
      setSidebarParentPath(data.navMain[0].title);
      setSidebarPath(data.navMain[0].items[0].title);
    }
  }, [data, setSidebarPath, setSidebarParentPath]);

  // Alternative approach: sync with current route
  React.useEffect(() => {
    // Find the current item based on the current route
    for (const group of data.navMain) {
      for (const item of group.items) {
        if (location.pathname === item.url) {
          setSidebarPath(item.title);
          setSidebarParentPath(group.title);
          localStorage.setItem('sidebarActivePath', item.title);
          localStorage.setItem('sidebarActiveUrl', item.url);
          localStorage.setItem('sidebarActiveParentPath', group.title);
          return;
        }
      }
    }
  }, [location.pathname, data, setSidebarPath, setSidebarParentPath]);

  const handleItemClick = (item: SidebarItem, group: SidebarGroupType) => {
    setSidebarPath(item.title);
    setSidebarParentPath(group.title);
    
    // Save to localStorage
    localStorage.setItem('sidebarActivePath', item.title);
    localStorage.setItem('sidebarActiveParentPath', group.title);
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={url === item.title}
                      onClick={() => handleItemClick(item, group)}
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-2"
                      >
                        <span className="flex items-center gap-2">
                          {item.icon ? <item.icon className="w-4 h-4" /> : null}
                          <span>{item.title}</span>
                        </span>
                      </Link>
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
  );
}
import * as React from "react";
import { Link } from "react-router-dom";
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

// Local storage keys
const SIDEBAR_PATH_KEY = "sidebar_active_path";
const SIDEBAR_PARENT_PATH_KEY = "sidebar_active_parent_path";

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  const { setSidebarPath, setSidebarParentPath, url } = useSidebar();

  // Get initial state from localStorage or use defaults
  const getInitialState = () => {
    if (typeof window === "undefined") return null;
    
    const savedPath = localStorage.getItem(SIDEBAR_PATH_KEY);
    const savedParentPath = localStorage.getItem(SIDEBAR_PARENT_PATH_KEY);
    
    return {
      path: savedPath,
      parentPath: savedParentPath
    };
  };

  // Save to localStorage whenever sidebar state changes
  React.useEffect(() => {
    if (url) {
      localStorage.setItem(SIDEBAR_PATH_KEY, url);
    }
  }, [url]);

  const saveParentPath = (parentPath: string) => {
    localStorage.setItem(SIDEBAR_PARENT_PATH_KEY, parentPath);
    setSidebarParentPath(parentPath);
  };

  // Set initial sidebar selection from localStorage or use first item as default
  React.useEffect(() => {
    const initialState = getInitialState();
    
    if (initialState?.path && initialState?.parentPath) {
      // Restore from localStorage
      setSidebarPath(initialState.path);
      setSidebarParentPath(initialState.parentPath);
    } else if (data.navMain.length > 0 && data.navMain[0].items.length > 0) {
      // Set default if no saved state exists
      const defaultParent = data.navMain[0].title;
      const defaultPath = data.navMain[0].items[0].title;
      
      setSidebarParentPath(defaultParent);
      setSidebarPath(defaultPath);
      
      // Save defaults to localStorage
      localStorage.setItem(SIDEBAR_PARENT_PATH_KEY, defaultParent);
      localStorage.setItem(SIDEBAR_PATH_KEY, defaultPath);
    }
  }, [data, setSidebarPath, setSidebarParentPath]);

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
                      onClick={() => {
                        setSidebarPath(item.title);
                        saveParentPath(group.title);
                      }}
                    >
                      {/* Wrap everything in a single element */}
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
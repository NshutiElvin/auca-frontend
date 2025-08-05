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

  // Set default sidebar selection to the first item
  React.useEffect(() => {
    if (data.navMain.length > 0 && data.navMain[0].items.length > 0) {
      setSidebarParentPath(data.navMain[0].title);
      setSidebarPath(data.navMain[0].items[0].title);
    }
  }, [data]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((pItem) => (
          <SidebarGroup key={pItem.title}>
            <SidebarGroupLabel>{pItem.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pItem.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={url === item.title}
                      onClick={() => {
                        setSidebarPath(item.title);
                        setSidebarParentPath(pItem.title);
                      }}
                    >
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
  );
}

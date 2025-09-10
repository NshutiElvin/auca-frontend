// import * as React from "react";
// import { Link } from "react-router-dom";
// import { VersionSwitcher } from "../components/version-switcher";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarRail,
// } from "../components/ui/sidebar";
// import useSidebar from "../hooks/useSidebar";

// // Define prop types
// type SidebarItem = {
//   title: string;
//   url: string;
//   icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
// };

// type SidebarGroupType = {
//   title: string;
//   url: string;
//   items: SidebarItem[];
// };

// type SidebarData = {
//   versions: string[];
//   navMain: SidebarGroupType[];
// };

// type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
//   data: SidebarData;
// };

// export function AppSidebar({ data, ...props }: AppSidebarProps) {
//   const { setSidebarPath, setSidebarParentPath, url } = useSidebar();

//   // Set default sidebar selection to the first item
//   React.useEffect(() => {
//     if (data.navMain.length > 0 && data.navMain[0].items.length > 0) {
//       setSidebarParentPath(data.navMain[0].title);
//       setSidebarPath(data.navMain[0].items[0].title);
//     }
//   }, [data]);

//   return (
//     <Sidebar {...props}>
//       <SidebarHeader>
//         <VersionSwitcher
//           versions={data.versions}
//           defaultVersion={data.versions[0]}
//         />
//       </SidebarHeader>

//       <SidebarContent>
//         {data.navMain.map((group) => (
//           <SidebarGroup key={group.title}>
//             <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {group.items.map((item) => (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton
//                       asChild
//                       isActive={url === item.title}
//                       onClick={() => {
//                         setSidebarPath(item.title);
//                         setSidebarParentPath(group.title);
//                       }}
//                     >
//                       {/* Wrap everything in a single element */}
//                       <Link
//                         to={item.url}
//                         className="flex items-center gap-2"
//                       >
//                         <span className="flex items-center gap-2">
//                           {item.icon ? <item.icon className="w-4 h-4" /> : null}
//                           <span>{item.title}</span>
//                         </span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>

//       <SidebarRail />
//     </Sidebar>
//   );
// }


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
  const location = useLocation(); // Get current location

  // Set default sidebar selection based on current path
  React.useEffect(() => {
    // Find the current item based on the pathname
    for (const group of data.navMain) {
      for (const item of group.items) {
        if (location.pathname === item.url) {
          setSidebarParentPath(group.title);
          setSidebarPath(item.title);
          return;
        }
      }
    }
    
    // Fallback to first item if no match found
    if (data.navMain.length > 0 && data.navMain[0].items.length > 0) {
      setSidebarParentPath(data.navMain[0].title);
      setSidebarPath(data.navMain[0].items[0].title);
    }
  }, [data, location.pathname]); // Add location.pathname as dependency

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
                      isActive={location.pathname === item.url} // Compare with actual URL
                      onClick={() => {
                        setSidebarPath(item.title);
                        setSidebarParentPath(group.title);
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
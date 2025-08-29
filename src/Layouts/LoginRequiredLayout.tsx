import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { SidebarProvider } from "../components/ui/sidebar";

const LoginRequiredLayout: React.FC = () => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <SidebarProvider><Outlet /></SidebarProvider>
};

export default LoginRequiredLayout;

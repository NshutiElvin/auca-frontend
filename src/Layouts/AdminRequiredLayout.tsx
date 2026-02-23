import { useLocation, Navigate, Outlet } from "react-router-dom";
import useUser from "../hooks/useUser";

const AdminRequiredLayout: React.FC = () => {
  const user = useUser()
  const location = useLocation();

  return user.role === "admin" ? (
        <Outlet />
      ) : (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
      )
};

export default AdminRequiredLayout;

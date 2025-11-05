// components/Common/PublicRoute.tsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
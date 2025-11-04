import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const ProtectedRoute = ({children}:{children:React.ReactNode})=>{
  const user = useSelector((state:RootState) => state.auth.user);
  
  console.log("ProtectedRoute - user:", user);
  
  if(!user){
    console.log("ProtectedRoute - No user, redirecting to /auth/login");
    return <Navigate to="/auth/login" replace/>
  }
  
  console.log("ProtectedRoute - User exists, showing protected content");
  return <>{children}</>;
}

export default ProtectedRoute;
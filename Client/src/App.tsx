import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "./api/authApi";
import { setUser } from "./store/authSlice";
import type { User } from "./types";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/authPages/Signup";
import AuthBody from "./Body/AuthBody";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import LoginPage from "./pages/authPages/LoginPage";
import type { RootState } from "./store/store";

const App = () => {
  const dispatch = useDispatch();

  const { isLoading } = useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const user = await getMe();
      if (user) {
        dispatch(setUser(user));
      }
      return user;
    },
    staleTime: Infinity,
    retry: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route path="/auth" element={<AuthBody />}>
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>
    </Routes>
  );
};

export default App;
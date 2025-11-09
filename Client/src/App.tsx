import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "./api/authApi";
import { setUser } from "./store/authSlice";
import type { User } from "./types";
import { Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthBody from "./Body/AuthBody";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import LoginPage from "./pages/authPages/LoginPage";
import type { RootState } from "./store/store";
import PublicRoute from "./components/Common/PublicRoute";
import PageDoesntExist from "./components/Common/PageDoesntExist";
import Signup from "./pages/authPages/Signup";
import CourseBody from "./Body/CoursesBody";
import GetAllCoursesPage from "./pages/CoursesPages/GetAllCoursesPage";

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
      <Route path="/" element={<HomePage />} />

      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthBody />
          </PublicRoute>
        }
      >
        <Route index element={<Navigate to="/auth/login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<Signup />} />
      </Route>

      <Route 
        path="/course"
        element={
          <ProtectedRoute>
            <CourseBody/>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/course/allCourses" replace />} />
        <Route path="allCourses" element={<GetAllCoursesPage/>} />
        
      </Route>

      <Route path="*" element={<PageDoesntExist />} />
    </Routes>
  );
};

export default App;

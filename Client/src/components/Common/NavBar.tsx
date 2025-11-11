import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../../api/authApi";
import { clearUser } from "../../store/authSlice";

const Navbar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      console.log("Logout Successful");
      dispatch(clearUser());
      console.log("User logged out successfully");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 50);
    },
    onError: (err: any) => console.error(err.response?.data || err.message),
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-serif text-gray-900">LMS</span>
        </Link>
        <Link to="/course/allCourses" className="flex items-center">
          <span className="text-xl font-serif text-gray-900 border-b-2 border-black hover:border-gray-900">Courses</span>
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/profile/user/me"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logoutMutation.isPending ? "Signing out..." : "Sign out"}
              </button>
            </>
          ) : (
            <Link to="/auth/login">
              <button className="px-6 py-2 bg-gray-900 text-white text-sm tracking-wide hover:bg-gray-800 transition-colors">
                Sign in
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

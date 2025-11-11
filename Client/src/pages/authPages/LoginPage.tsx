import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../api/authApi";
import type { LoginCredentials } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "../../store/authSlice";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: LoginCredentials) => loginUser(data),
    onSuccess: (user) => {
      console.log("Login successful, user:", user);
      dispatch(setUser(user));
      console.log("User dispatched, navigating...");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 50);
    },
    onError: (err: any) => console.error(err.response?.data || err.message),
  });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    mutation.mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <h1 className="text-4xl font-serif text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 text-base">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="alex@example.com"
              className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors"
            />
          </div>

          {mutation.isError && (
            <div className="text-sm text-red-600 px-4 py-3 bg-red-50 border-l-2 border-red-600">
              Unable to sign in. Please check your credentials.
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full mt-8 py-4 bg-gray-900 hover:bg-gray-800 text-white text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="text-gray-900 underline underline-offset-4 hover:no-underline transition"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
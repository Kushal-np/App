import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signupUser, type SignupData } from "../../api/authApi";
import { setUser } from "../../store/authSlice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: (data: SignupData) => signupUser(data),
    onSuccess: (user) => {
      dispatch(setUser(user));
      setTimeout(() => navigate("/", { replace: true }), 180);
    },
    onError: (err: any) => console.error(err.response?.data || err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    signupMutation.mutate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <h1 className="text-4xl font-serif text-gray-900 mb-2">
            Create account
          </h1>
          <p className="text-gray-600 text-base">
            Join us today and get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Alex Rivera"
              className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors"
            />
          </div>

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
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm text-gray-700 mb-2">
              I am a
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue="student"
              className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23111827' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                backgroundPosition: 'right 1rem center', 
                backgroundRepeat: 'no-repeat', 
                backgroundSize: '1.25em' 
              }}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full mt-8 py-4 bg-gray-900 hover:bg-gray-800 text-white text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
          >
            {signupMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-gray-900 underline underline-offset-4 hover:no-underline transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

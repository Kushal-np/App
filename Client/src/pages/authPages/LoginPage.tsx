import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../api/authApi";
import type { LoginCredentials } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
      
      // Small delay to ensure Redux updates
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
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" type="email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Logging in..." : "Login"}
      </button>
      {mutation.isError && <div style={{color: 'red'}}>Login failed</div>}
    </form>
  );
};

export default LoginPage;
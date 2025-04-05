import { useState } from "react";
import { loginUser } from "../services/authService";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      toast.success("Login successful!");
      localStorage.setItem("token", data.token); // or user data
      // redirect to dashboard
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed!");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Invalid email or password");
        setLoading(false);
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Seamlessly redirect based on the authenticated user's role from the backend
      if (data.user.role === "DONOR") {
        navigate("/donor");
      } else if (data.user.role === "NGO") {
        navigate("/ngo");
      } else if (data.user.role === "VOLUNTEER") {
        navigate("/volunteer");
      } else if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        setMessage("Unknown user role");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Cannot connect to backend. Please ensure the server is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="appetite-badge">
            <span>🔥 FOOD RESCUE PLATFORM</span>
          </div>
        </div>

        <h1>Welcome Back</h1>
        <p>Enter your credentials to access your account</p>

        <form onSubmit={handleLogin}>
          <div className="auth-input-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. name@organization.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-btn auth-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <div className="auth-footer-link">
          Don't have an account yet?{" "}
          <Link to="/register">Create an Account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
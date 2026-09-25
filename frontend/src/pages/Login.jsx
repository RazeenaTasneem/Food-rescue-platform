import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      // FastAPI OAuth2PasswordRequestForm expects
      // username and password as form data.
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(
        "http://127.0.0.1:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      // Handle backend errors
      if (!response.ok) {
        setMessage(data.detail || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Save JWT token
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Save logged-in user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log("Login successful:", data);

      /*
        Redirect according to the user's role.
      */

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

      setMessage(
        "Cannot connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p>
          Login to your FoodRescue account
        </p>

        <form onSubmit={handleLogin}>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {/* Login Button */}
          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Message */}
        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
}

export default Login;
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync current user on route changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === "ADMIN") return "/admin";
    if (currentUser.role === "NGO") return "/ngo";
    if (currentUser.role === "DONOR") return "/donor";
    return "/login";
  };

  const getDashboardLabel = () => {
    if (!currentUser) return "Dashboard";
    if (currentUser.role === "ADMIN") return "🛡️ Admin Panel";
    if (currentUser.role === "NGO") return "🤝 NGO Dashboard";
    if (currentUser.role === "DONOR") return "🍱 Donor Dashboard";
    return "Dashboard";
  };

  return (
    <nav className="navbar animate-fade-in">
      <Link to="/" className="logo nav-brand">
        <span className="brand-icon">🔥</span> Share<span>Bite</span>
        <span className="brand-tagline">FOOD RESCUE</span>
      </Link>

      <div className="nav-links">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        <a href="/#how-it-works" className="nav-link">
          How It Works
        </a>
        <a href="/#about" className="nav-link">
          About
        </a>

        {currentUser ? (
          <>
            <Link to={getDashboardPath()} className="login-btn">
              {getDashboardLabel()}
            </Link>
            <button
              onClick={handleLogout}
              className="register-btn"
              style={{ cursor: "pointer", background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.4)" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>
            <Link to="/register" className="register-btn">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
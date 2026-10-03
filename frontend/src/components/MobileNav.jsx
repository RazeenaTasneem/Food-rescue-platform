import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function MobileNav() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`mobile-nav-item ${isActive("/") ? "active" : ""}`}>
        <span className="nav-icon">🍲</span>
        <span>Explore</span>
      </Link>

      {currentUser?.role === "DONOR" ? (
        <Link to="/donor" className={`mobile-nav-item ${isActive("/donor") ? "active" : ""}`}>
          <span className="nav-icon">🍱</span>
          <span>My Food</span>
        </Link>
      ) : currentUser?.role === "NGO" ? (
        <Link to="/ngo" className={`mobile-nav-item ${isActive("/ngo") ? "active" : ""}`}>
          <span className="nav-icon">🤝</span>
          <span>Rescues</span>
        </Link>
      ) : (
        <Link to="/ngo" className={`mobile-nav-item ${isActive("/ngo") ? "active" : ""}`}>
          <span className="nav-icon">🤝</span>
          <span>Rescues</span>
        </Link>
      )}

      {/* Center Floating Action Button (Donate) */}
      <Link to="/create-donation" className="mobile-nav-item fab-item">
        <div className="fab-btn">＋</div>
        <span style={{ marginTop: "2px" }}>Donate</span>
      </Link>

      {currentUser?.role === "ADMIN" ? (
        <Link to="/admin" className={`mobile-nav-item ${isActive("/admin") ? "active" : ""}`}>
          <span className="nav-icon">🛡️</span>
          <span>Admin</span>
        </Link>
      ) : currentUser ? (
        <Link
          to={currentUser.role === "DONOR" ? "/donor" : "/ngo"}
          className={`mobile-nav-item ${isActive("/donor") || isActive("/ngo") ? "active" : ""}`}
        >
          <span className="nav-icon">👤</span>
          <span>Account</span>
        </Link>
      ) : (
        <Link to="/login" className={`mobile-nav-item ${isActive("/login") ? "active" : ""}`}>
          <span className="nav-icon">🔑</span>
          <span>Login</span>
        </Link>
      )}
    </nav>
  );
}

export default MobileNav;

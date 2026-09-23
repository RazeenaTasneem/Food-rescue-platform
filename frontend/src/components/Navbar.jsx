import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        Food<span>Rescue</span>
      </Link>

      <div className="nav-links">

        <a href="#how-it-works">
          How It Works
        </a>

        <a href="#about">
          About
        </a>

        <Link to="/login" className="login-btn">
          Login
        </Link>

        <Link to="/register" className="get-started-btn">
          Get Started
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;
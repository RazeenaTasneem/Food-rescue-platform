import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "DONOR"
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          setMessage(data.detail[0].msg);
        } else {
          setMessage(data.detail || "Registration failed");
        }
      } else {
        alert("Account created successfully! 🎉 Please log in.");
        navigate("/login");
      }
    } catch (error) {
      setMessage("Cannot connect to backend. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="appetite-badge">
            <span>🔥 ZERO FOOD WASTE INITIATIVE</span>
          </div>
        </div>

        <h1>Create Account</h1>
        <p>Join the ShareBite community to save meals</p>

        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Full Name or Organization Name" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            type="email" 
            placeholder="Work or Personal Email" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="tel" 
            placeholder="Phone Number (10 digits)" 
            required 
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Create Secure Password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <select 
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            required
            className="role-select"
            style={{ 
              padding: '14px 16px', 
              background: 'var(--bg-input)', 
              border: '1px solid var(--border-light)', 
              borderRadius: 'var(--radius-md)', 
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '15px'
            }}
          >
            <option value="DONOR">🍱 Donor (Restaurant / Hotel / Caterer)</option>
            <option value="NGO">🤝 NGO (Food Rescue Organization)</option>
            <option value="ADMIN">🛡️ Platform Admin</option>
          </select>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Join ShareBite Network"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--brand-primary)", fontWeight: "700", textDecoration: "none" }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
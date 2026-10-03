import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import heroFoodImg from "../assets/hero-food.jpg";
import buffetFoodImg from "../assets/buffet-food.jpg";
import bakeryFoodImg from "../assets/bakery-food.jpg";
import "./Dashboard.css";

function DonorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    mealsRescued: 0,
    completedPickups: 0,
    communityImpact: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("access_token");

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser.role !== "DONOR") {
          navigate("/login");
          return;
        }

        setUser(parsedUser);

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch donations
        const donationsRes = await fetch(`${API_BASE_URL}/donations/my`, { headers });
        
        if (donationsRes.status === 401) {
          handleLogout();
          return;
        }

        if (!donationsRes.ok) throw new Error("Failed to load donations");
        setDonations(await donationsRes.json());

        // Fetch stats
        const statsRes = await fetch(`${API_BASE_URL}/donations/my/stats`, { headers });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getFoodImage = (foodName, foodType) => {
    const lower = (foodName || "").toLowerCase();
    if (lower.includes("bread") || lower.includes("bakery") || lower.includes("cake") || lower.includes("croissant")) {
      return bakeryFoodImg;
    }
    if (foodType === "NON_VEGETARIAN" || lower.includes("buffet") || lower.includes("feast") || lower.includes("roast")) {
      return buffetFoodImg;
    }
    return heroFoodImg;
  };

  if (loading) return <div className="dashboard-loading">Loading your donor portal...</div>;
  if (!user) return null;

  return (
    <main className="dashboard-page appetite-dashboard">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <section className="dashboard-header app-hero-header">
          <div>
            <div className="appetite-badge">
              <span>🍱 RESTAURANT & CATERING PORTAL</span>
            </div>
            <h1>Welcome, {user.name} 👋</h1>
            <p>Every donation transforms kitchen surplus into vital community nourishment.</p>
          </div>
          <button className="secondary-btn logout-header-btn" onClick={handleLogout}>
            Logout
          </button>
        </section>

        {/* Quick Action Banner */}
        <div className="quick-post-banner">
          <div className="quick-post-text">
            <h3>Fresh Surplus Food Ready Right Now?</h3>
            <p>List extra cooked food or bakery surplus in 60 seconds for verified NGO pickup.</p>
          </div>
          <button 
            className="primary-btn quick-post-btn" 
            onClick={() => navigate("/create-donation")}
          >
            ＋ Create New Food Donation
          </button>
        </div>

        {/* Statistics Grid */}
        <section className="stats-grid appetite-stats-grid">
          <div className="stat-card stat-card-highlight">
            <span className="stat-icon">🍱</span>
            <strong className="stat-value">{stats.totalDonations}</strong>
            <span className="stat-label">Total Listings</span>
            <small className="stat-sub">Created by your kitchen</small>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🍲</span>
            <strong className="stat-value">{stats.mealsRescued}</strong>
            <span className="stat-label">Meals Shared</span>
            <small className="stat-sub">Plated food saved from landfill</small>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🚚</span>
            <strong className="stat-value">{stats.completedPickups}</strong>
            <span className="stat-label">Completed Rescues</span>
            <small className="stat-sub">Safely distributed to shelters</small>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🌱</span>
            <strong className="stat-value">{Math.round(stats.mealsRescued * 2.1)} kg</strong>
            <span className="stat-label">CO₂ Offset</span>
            <small className="stat-sub">Environmental impact achieved</small>
          </div>
        </section>

        {/* Donations List */}
        <section className="dashboard-section">
          <div className="section-header-compact">
            <div>
              <h2>Your Listed Food Donations</h2>
              <p>Real-time status of your surplus listings and NGO match updates.</p>
            </div>
            <button 
              className="primary-btn create-donation-btn" 
              onClick={() => navigate("/create-donation")}
            >
              ＋ Post Donation
            </button>
          </div>

          {donations.length === 0 ? (
            <div className="empty-donations">
              <div className="empty-icon">🍲</div>
              <h3>No active food donations yet</h3>
              <p>Your food listings will appear here once you post your first donation.</p>
              <button className="primary-btn empty-create-btn" onClick={() => navigate("/create-donation")}>
                Create Your First Donation
              </button>
            </div>
          ) : (
            <div className="appetite-cards-grid">
              {donations.map((donation) => (
                <div className="food-rescue-card" key={donation.id}>
                  <div className="card-thumb-wrap">
                    <img 
                      src={getFoodImage(donation.food_name, donation.food_type)} 
                      alt={donation.food_name} 
                      className="card-thumb-img"
                    />
                    <div className="thumb-meals-badge">
                      <strong>{donation.quantity}</strong> MEALS
                    </div>
                    <div className={`thumb-status-badge ${String(donation.status).toLowerCase()}`}>
                      {donation.status}
                    </div>
                  </div>

                  <div className="card-content-wrap">
                    <div className="card-meta">
                      {donation.food_type === "VEGETARIAN" ? (
                        <span className="badge-veg">100% PURE VEG</span>
                      ) : (
                        <span className="badge-nonveg">NON-VEG</span>
                      )}
                      <span className="card-expiry">
                        Available until: {new Date(donation.available_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="card-title">{donation.food_name}</h3>

                    <div className="card-pickup-info">
                      <span className="pickup-pin">📍</span>
                      <p className="pickup-text">
                        <strong>Pickup Address:</strong> {donation.address}
                      </p>
                    </div>

                    <div className="card-action-row">
                      <span className="sub-text">
                        Listed {new Date(donation.created_at).toLocaleDateString()}
                      </span>
                      <span className={`status-pill ${String(donation.status).toLowerCase()}`}>
                        {donation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default DonorDashboard;
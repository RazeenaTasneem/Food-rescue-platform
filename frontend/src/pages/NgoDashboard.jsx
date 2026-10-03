import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroFoodImg from "../assets/hero-food.jpg";
import buffetFoodImg from "../assets/buffet-food.jpg";
import bakeryFoodImg from "../assets/bakery-food.jpg";
import "./Dashboard.css";

function NgoDashboard() {
  const [donations, setDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("available"); // "available" or "accepted"
  const [filterType, setFilterType] = useState("ALL"); // ALL, VEGETARIAN, NON_VEGETARIAN
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    availableDonations: 0,
    availableMeals: 0,
    acceptedCount: 0,
    peopleServed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [requestingId, setRequestingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDonationsAndStats();
  }, []);

  const fetchDonationsAndStats = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch available donations
      const response = await fetch((import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/ngo/donations", { headers });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        const data = await response.json();
        setMessage(data.detail || "Unable to load donations");
        return;
      }

      const availableData = await response.json();
      setDonations(availableData);

      // Fetch NGO's accepted requests
      const requestsRes = await fetch((import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/ngo/my-requests", { headers });
      if (requestsRes.ok) {
        const reqData = await requestsRes.json();
        setMyRequests(reqData);
      }

      // Fetch stats
      const statsRes = await fetch((import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/ngo/stats", { headers });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

    } catch (error) {
      console.error("NGO dashboard error:", error);
      setMessage("Cannot connect to the backend. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFood = async (donationId) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      setRequestingId(donationId);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/ngo/request/${donationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        const data = await response.json();
        setMessage(data.detail || "Unable to accept this donation");
        return;
      }

      alert("Food accepted successfully! 🎉\n\nThe donation has been matched to your NGO.");

      await fetchDonationsAndStats();
      setActiveTab("accepted");

    } catch (error) {
      console.error("Request food error:", error);
      setMessage("Cannot connect to the backend. Make sure FastAPI is running.");
    } finally {
      setRequestingId(null);
    }
  };

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

  const filteredDonations = donations.filter((d) => {
    const matchesFilter = filterType === "ALL" || d.food_type === filterType;
    const matchesQuery = !searchQuery || 
      d.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard-page appetite-dashboard">
      <div className="dashboard-container">
        {/* HEADER */}
        <div className="dashboard-header app-hero-header">
          <div>
            <div className="appetite-badge">
              <span>🤝 NGO RESCUE COMMAND</span>
            </div>
            <h1>Welcome, {user.name || "Food Rescuer"} 👋</h1>
            <p>Claim delicious surplus meals in your area and deliver hope to your community.</p>
          </div>
          <button className="secondary-btn logout-header-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* METRICS */}
        <div className="stats-grid appetite-stats-grid">
          <div className="stat-card stat-card-highlight">
            <span className="stat-icon">🍱</span>
            <strong className="stat-value">{stats.availableDonations}</strong>
            <span className="stat-label">Available Donations</span>
            <small className="stat-sub">Ready for immediate pickup</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🍲</span>
            <strong className="stat-value">{stats.availableMeals}</strong>
            <span className="stat-label">Available Meals</span>
            <small className="stat-sub">Nourishment awaiting rescue</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🤝</span>
            <strong className="stat-value">{stats.acceptedCount}</strong>
            <span className="stat-label">Rescues Accepted</span>
            <small className="stat-sub">Coordinated by your team</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">❤️</span>
            <strong className="stat-value">{stats.acceptedCount * 50 || stats.peopleServed}</strong>
            <span className="stat-label">Estimated People Fed</span>
            <small className="stat-sub">Direct nutritional impact</small>
          </div>
        </div>

        {/* CONTROLS BAR: TABS & FILTERS */}
        <div className="dashboard-controls-bar">
          <div className="dashboard-tabs">
            <button
              className={`dash-tab-btn ${activeTab === "available" ? "active" : ""}`}
              onClick={() => setActiveTab("available")}
            >
              🍱 Available Food ({donations.length})
            </button>
            <button
              className={`dash-tab-btn ${activeTab === "accepted" ? "active" : ""}`}
              onClick={() => setActiveTab("accepted")}
            >
              🤝 My Accepted Rescues ({myRequests.length})
            </button>
          </div>

          {activeTab === "available" && (
            <div className="filter-chips-row">
              <button
                className={`filter-chip ${filterType === "ALL" ? "active" : ""}`}
                onClick={() => setFilterType("ALL")}
              >
                All
              </button>
              <button
                className={`filter-chip ${filterType === "VEGETARIAN" ? "active" : ""}`}
                onClick={() => setFilterType("VEGETARIAN")}
              >
                🌿 Pure Veg
              </button>
              <button
                className={`filter-chip ${filterType === "NON_VEGETARIAN" ? "active" : ""}`}
                onClick={() => setFilterType("NON_VEGETARIAN")}
              >
                🍗 Non-Veg
              </button>
              <input
                type="text"
                placeholder="Search food or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
          )}
        </div>

        {/* AVAILABLE FOOD TAB */}
        {activeTab === "available" ? (
          <section className="dashboard-section">
            <div className="section-header-compact">
              <h2>Fresh Surplus Ready for Pickup</h2>
              <button className="secondary-btn refresh-btn-compact" onClick={fetchDonationsAndStats} disabled={loading}>
                {loading ? "Refreshing..." : "🔄 Refresh List"}
              </button>
            </div>

            {loading && <div className="empty-state">Loading delicious food surplus...</div>}
            {!loading && message && <div className="empty-state">{message}</div>}

            {!loading && !message && filteredDonations.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🍲</div>
                <h3>No food available matching criteria</h3>
                <p>New freshly cooked surplus donations will show up here in real time.</p>
              </div>
            )}

            {!loading && !message && filteredDonations.length > 0 && (
              <div className="appetite-cards-grid">
                {filteredDonations.map((donation) => (
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
                      <div className="thumb-urgency-badge">⚡ READY NOW</div>
                    </div>

                    <div className="card-content-wrap">
                      <div className="card-meta">
                        {donation.food_type === "VEGETARIAN" ? (
                          <span className="badge-veg">100% PURE VEG</span>
                        ) : (
                          <span className="badge-nonveg">NON-VEG</span>
                        )}
                        <span className="card-expiry">
                          ⏳ Till {new Date(donation.available_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="card-title">{donation.food_name}</h3>

                      <div className="card-pickup-info">
                        <span className="pickup-pin">📍</span>
                        <p className="pickup-text">
                          <strong>Pickup:</strong> {donation.address}
                        </p>
                      </div>

                      <div className="card-action-row">
                        <div className="status-label available">
                          ● AVAILABLE
                        </div>
                        <button
                          className="primary-btn claim-now-btn"
                          onClick={() => handleRequestFood(donation.id)}
                          disabled={requestingId === donation.id}
                        >
                          {requestingId === donation.id ? "Accepting..." : "⚡ Accept & Rescue"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* MY ACCEPTED RESCUES TAB */
          <section className="dashboard-section">
            <div className="section-header-compact">
              <h2>My Accepted Food Rescues</h2>
              <p>Donations matched to your NGO for distribution.</p>
            </div>

            {loading && <div className="empty-state">Loading your rescue missions...</div>}

            {!loading && myRequests.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🤝</div>
                <h3>No accepted rescues yet</h3>
                <p>Browse available surplus food above and accept your first donation!</p>
                <button
                  className="primary-btn"
                  onClick={() => setActiveTab("available")}
                  style={{ marginTop: "16px" }}
                >
                  Browse Available Food
                </button>
              </div>
            )}

            {!loading && myRequests.length > 0 && (
              <div className="appetite-cards-grid">
                {myRequests.map((req) => (
                  <div className="food-rescue-card matched-rescue-card" key={req.mission_id}>
                    <div className="card-thumb-wrap">
                      <img 
                        src={getFoodImage(req.food_name, req.food_type)} 
                        alt={req.food_name} 
                        className="card-thumb-img"
                      />
                      <div className="thumb-meals-badge">
                        <strong>{req.quantity}</strong> MEALS
                      </div>
                      <div className="thumb-status-badge matched">
                        🤝 MATCHED
                      </div>
                    </div>

                    <div className="card-content-wrap">
                      <div className="card-meta">
                        {req.food_type === "VEGETARIAN" ? (
                          <span className="badge-veg">100% PURE VEG</span>
                        ) : (
                          <span className="badge-nonveg">NON-VEG</span>
                        )}
                        <span className="card-expiry">
                          Mission M#{req.mission_id}
                        </span>
                      </div>

                      <h3 className="card-title">{req.food_name}</h3>

                      <div className="card-pickup-info">
                        <span className="pickup-pin">📍</span>
                        <p className="pickup-text">
                          <strong>Pickup:</strong> {req.address}
                        </p>
                      </div>

                      <div className="card-action-row">
                        <div className="matched-timestamp">
                          Accepted on {new Date(req.created_at).toLocaleDateString()}
                        </div>
                        <span className="mission-active-pill">
                          Ready for Collection
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default NgoDashboard;
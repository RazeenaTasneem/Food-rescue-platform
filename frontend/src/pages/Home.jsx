import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import heroFoodImg from "../assets/hero-food.jpg";
import buffetFoodImg from "../assets/buffet-food.jpg";
import bakeryFoodImg from "../assets/bakery-food.jpg";
import "./Home.css";

function Home() {
  const [stats, setStats] = useState({
    meals_rescued: 0,
    donors: 0,
    ngos: 0,
    volunteers: 0
  });

  const [liveDonations, setLiveDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    // 1. Fetch real platform stats from backend
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch global stats:", error);
      }
    };

    // 2. Fetch actual live surplus food donations from backend
    const fetchLiveDonations = async () => {
      try {
        setLoadingDonations(true);
        const response = await fetch(`${API_BASE_URL}/donations/public`);
        if (response.ok) {
          const data = await response.json();
          setLiveDonations(data);
        }
      } catch (error) {
        console.error("Failed to fetch public donations:", error);
      } finally {
        setLoadingDonations(false);
      }
    };
    
    fetchStats();
    fetchLiveDonations();
  }, []);

  const categories = [
    { id: "all", label: "🔥 All Surplus", icon: "✨" },
    { id: "meals", label: "🍛 Hot Meals & Rice", icon: "🍛" },
    { id: "buffet", label: "🥘 Banquet Buffets", icon: "🥘" },
    { id: "bakery", label: "🥐 Bakery & Bread", icon: "🥐" },
    { id: "veg", label: "🌿 Pure Veg Only", icon: "🌿" },
  ];

  const getFoodImage = (foodName, foodType) => {
    const lower = (foodName || "").toLowerCase();
    if (lower.includes("bread") || lower.includes("bakery") || lower.includes("croissant") || lower.includes("pastry")) {
      return bakeryFoodImg;
    }
    if (foodType === "NON_VEGETARIAN" || lower.includes("buffet") || lower.includes("feast") || lower.includes("roast")) {
      return buffetFoodImg;
    }
    return heroFoodImg;
  };

  // Filter actual backend donations by selected category
  const filteredDonations = liveDonations.filter((d) => {
    if (activeCategory === "veg") return d.food_type === "VEGETARIAN";
    if (activeCategory === "bakery") {
      const lower = d.food_name.toLowerCase();
      return lower.includes("bread") || lower.includes("bakery") || lower.includes("pastry");
    }
    if (activeCategory === "buffet") {
      const lower = d.food_name.toLowerCase();
      return lower.includes("buffet") || lower.includes("banquet") || lower.includes("spread");
    }
    if (activeCategory === "meals") {
      const lower = d.food_name.toLowerCase();
      return lower.includes("rice") || lower.includes("biryani") || lower.includes("curry") || lower.includes("meal");
    }
    return true;
  });

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-appetite">
        <div className="hero-grid">
          <div className="hero-text-col">
            <div className="appetite-badge">
              <span className="badge-flame">🔥</span>
              <span>RESCUE SURPLUS FOOD • FEED THOSE IN NEED</span>
            </div>

            <h1 className="hero-headline">
              Delicious Food Deserves To Be
              <span className="headline-gradient"> Savored, Not Wasted.</span>
            </h1>

            <p className="hero-subtext">
              We connect restaurants, luxury banquets, and caterers with 
              active NGOs to rescue freshly cooked, gourmet surplus food before it spoils.
            </p>

            <div className="hero-cta-group">
              <Link to="/create-donation" className="primary-btn hero-main-btn">
                🍱 Donate Surplus Food
              </Link>
              <Link to="/ngo" className="secondary-btn hero-sec-btn">
                🤝 Claim Food (NGOs)
              </Link>
            </div>

            {/* Quick trust metrics from actual backend */}
            <div className="hero-trust-bar">
              <div className="trust-item">
                <span className="trust-icon">⏱️</span>
                <div>
                  <strong>&lt; 30 Mins</strong>
                  <span>Avg. Rescue Match</span>
                </div>
              </div>
              <div className="trust-separator"></div>
              <div className="trust-item">
                <span className="trust-icon">🍲</span>
                <div>
                  <strong>{stats.meals_rescued}+ Meals</strong>
                  <span>Rescued to Date</span>
                </div>
              </div>
              <div className="trust-separator"></div>
              <div className="trust-item">
                <span className="trust-icon">🏪</span>
                <div>
                  <strong>{stats.donors} Donors</strong>
                  <span>Active Kitchens</span>
                </div>
              </div>
            </div>
          </div>

          {/* HERO VISUAL BANNER */}
          <div className="hero-visual-col">
            <div className="hero-image-wrapper">
              <img 
                src={heroFoodImg} 
                alt="Delicious fresh feast ready for rescue" 
                className="hero-main-image"
              />
              <div className="image-overlay-glow"></div>

              {/* Floating Real-time Badges */}
              <div className="floating-badge badge-top-left">
                <span className="live-dot"></span>
                <div>
                  <strong>Live Surplus Alert</strong>
                  <small>{liveDonations.length} Active Listings in Database</small>
                </div>
              </div>

              <div className="floating-badge badge-bottom-right">
                <span className="floating-icon">🌱</span>
                <div>
                  <strong style={{ color: "#10b981" }}>{stats.meals_rescued} Meals Saved</strong>
                  <small>{stats.ngos} NGOs Partnered</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY EXPLORER */}
      <section className="category-section">
        <div className="category-scroll">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED SURPLUS FOOD SPOTLIGHT (REAL DATA FROM BACKEND) */}
      <section className="food-spotlight-section">
        <div className="section-title-wrap">
          <div>
            <span className="section-eyebrow">LIVE FROM DATABASE</span>
            <h2>Fresh Surplus Food Near You</h2>
            <p>Hot meals and fresh bakery items directly logged from verified kitchens.</p>
          </div>
          <Link to="/ngo" className="view-all-link">
            Explore All Rescues →
          </Link>
        </div>

        {loadingDonations ? (
          <div className="empty-state">Loading live surplus food...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍲</div>
            <h3>No surplus food in this category right now</h3>
            <p>Donations created by donors will appear here live.</p>
            <Link to="/create-donation" className="primary-btn" style={{ marginTop: "16px", display: "inline-block" }}>
              + List Surplus Food
            </Link>
          </div>
        ) : (
          <div className="food-cards-grid">
            {filteredDonations.map((item) => (
              <div className="appetite-food-card" key={item.id}>
                <div className="card-image-container">
                  <img 
                    src={getFoodImage(item.food_name, item.food_type)} 
                    alt={item.food_name} 
                    className="card-food-image" 
                  />
                  <div className="card-tag">
                    {item.food_type === "VEGETARIAN" ? "PURE VEG" : "NON-VEG"}
                  </div>
                  <div className={`card-urgency ${item.status.toLowerCase()}`}>
                    {item.status === "AVAILABLE" ? "⚡ AVAILABLE NOW" : "🤝 " + item.status}
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-meta-row">
                    {item.food_type === "VEGETARIAN" ? (
                      <span className="badge-veg">100% PURE VEG</span>
                    ) : (
                      <span className="badge-nonveg">NON-VEG</span>
                    )}
                    <span className="expiry-tag">
                      ⏳ {item.available_until ? new Date(item.available_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Today"}
                    </span>
                  </div>

                  <h3 className="card-food-title">{item.food_name}</h3>
                  
                  <p className="card-donor-name">
                    🏪 <strong>{item.donor_name || "Verified Kitchen"}</strong>
                  </p>

                  <p className="card-address">
                    📍 {item.address}
                  </p>

                  <div className="card-footer">
                    <div className="card-meals-count">
                      <strong>{item.quantity}</strong>
                      <span>Meals</span>
                    </div>

                    <Link to="/ngo" className="primary-btn card-claim-btn">
                      Claim Food ➔
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS - APP STYLE JOURNEY */}
      <section className="how-it-works-journey" id="how-it-works">
        <div className="journey-header">
          <span className="section-eyebrow">SIMPLE 4-STEP PROCESS</span>
          <h2>How ShareBite Works</h2>
          <p>Seamlessly bridging kitchens with surplus to communities in hunger.</p>
        </div>

        <div className="journey-steps-grid">
          <div className="journey-step-card">
            <div className="step-number">01</div>
            <div className="step-icon-bubble">👨‍🍳</div>
            <h3>List Safe Surplus</h3>
            <p>Kitchens and banquet hosts post surplus food details and pickup address in under 60 seconds.</p>
          </div>

          <div className="journey-step-card">
            <div className="step-number">02</div>
            <div className="step-icon-bubble">⚡</div>
            <h3>Instant NGO Alert</h3>
            <p>Nearby verified food rescue organizations receive automated real-time alerts.</p>
          </div>

          <div className="journey-step-card">
            <div className="step-number">03</div>
            <div className="step-icon-bubble">🚚</div>
            <h3>Safe Fast Pickup</h3>
            <p>Dedicated food rescue volunteers collect food in temperature-safe containers.</p>
          </div>

          <div className="journey-step-card">
            <div className="step-number">04</div>
            <div className="step-icon-bubble">❤️</div>
            <h3>Hunger Satisfied</h3>
            <p>Nutritious meals are served with dignity to shelter homes and vulnerable communities.</p>
          </div>
        </div>
      </section>

      {/* IMPACT BANNER */}
      <section className="impact-cta-banner">
        <div className="impact-banner-content">
          <div className="banner-left">
            <span className="banner-tag">🌱 TOGETHER WE CAN ZERO HUNGER</span>
            <h2>Are You a Restaurant, Caterer or Event Host?</h2>
            <p>Turn excess food into life-saving meals and boost your social sustainability.</p>
          </div>
          <div className="banner-right">
            <Link to="/create-donation" className="primary-btn banner-btn">
              🍱 List Surplus Food Now
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="app-footer" id="about">
        <div className="footer-top">
          <div className="footer-brand-info">
            <div className="footer-logo">
              🔥 Share<span>Bite</span>
            </div>
            <p>
              The technology platform bridging food excess with nutritional hunger.
              Saving meals, nurturing communities, protecting the planet.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Quick Links</h4>
              <Link to="/create-donation">Donate Food</Link>
              <Link to="/ngo">NGO Rescues</Link>
              <Link to="/login">Account Login</Link>
              <Link to="/register">Join the Network</Link>
            </div>
            <div className="footer-col">
              <h4>Roles</h4>
              <Link to="/register">For Restaurants</Link>
              <Link to="/register">For NGOs</Link>
              <Link to="/register">For Volunteers</Link>
              <Link to="/admin">Admin Portal</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ShareBite Platform. Connected live to Food Rescue Platform Backend.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
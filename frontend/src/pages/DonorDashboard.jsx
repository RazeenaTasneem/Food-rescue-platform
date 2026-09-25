import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DonorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
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

        const response = await fetch(
          "http://127.0.0.1:8000/donations/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // If token is invalid or expired, redirect to login
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load donations");
        }

        const donationData = await response.json();

        setDonations(donationData);
      } catch (error) {
        console.error("Dashboard error:", error);
        setDonations([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const totalDonations = donations.length;

  const mealsRescued = donations.reduce(
    (total, donation) =>
      total + Number(donation.quantity || 0),
    0
  );

  const completedPickups = donations.filter(
    (donation) => donation.status === "DELIVERED"
  ).length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* Welcome */}
        <section className="dashboard-welcome">

          <div>
            <p className="dashboard-label">
              DONOR DASHBOARD
            </p>

            <h1>
              Welcome, {user.name} 👋
            </h1>

            <p className="dashboard-subtitle">
              Help turn surplus food into meaningful
              community impact.
            </p>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </section>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">🍱</div>

            <div className="stat-value">
              {totalDonations}
            </div>

            <div className="stat-label">
              Total Donations
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">♻️</div>

            <div className="stat-value">
              {mealsRescued}
            </div>

            <div className="stat-label">
              Meals Rescued
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚚</div>

            <div className="stat-value">
              {completedPickups}
            </div>

            <div className="stat-label">
              Completed Pickups
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❤️</div>

            <div className="stat-value">
              {mealsRescued}
            </div>

            <div className="stat-label">
              Community Impact
            </div>
          </div>

        </section>

        {/* Donations */}
        <section className="donations-section">

          <div className="section-header">

            <div>
              <h2>Food Donations</h2>

              <p>
                Create and track your surplus food
                donations.
              </p>
            </div>

            <button
              className="create-donation-btn"
              onClick={() => navigate("/create-donation")}
            >
              + Create Donation
            </button>

          </div>

          {donations.length === 0 ? (

            <div className="empty-donations">

              <div className="empty-icon">
                🍲
              </div>

              <h3>
                No donations yet
              </h3>

              <p>
                Your food donations will appear here
                once you create your first donation.
              </p>

              <button
                className="empty-create-btn"
                onClick={() => navigate("/donor/create")}
              >
                Create Your First Donation
              </button>

            </div>

          ) : (

            <div className="donation-list">

              {donations.map((donation) => (

                <div
                  className="donation-item"
                  key={donation.id}
                >

                  <div className="donation-icon">
                    🍱
                  </div>

                  <div className="donation-info">

                    <h3>
                      {donation.food_name}
                    </h3>

                    <p>
                      {donation.food_type}
                    </p>

                  </div>

                  <div className="donation-quantity">

                    <strong>
                      {donation.quantity}
                    </strong>

                    <span>
                      meals
                    </span>

                  </div>

                  <div
                    className={`donation-status ${String(
                      donation.status
                    ).toLowerCase()}`}
                  >
                    {donation.status}
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NgoDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [requestingId, setRequestingId] = useState(null);
  const [acceptedCount, setAcceptedCount] = useState(0);

  const navigate = useNavigate();

  // --------------------------------------------------
  // Load available donations
  // --------------------------------------------------
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/ngo/donations",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setMessage(
          data.detail || "Unable to load donations"
        );
        return;
      }

      setDonations(data);
    } catch (error) {
      console.error("NGO dashboard error:", error);
      setMessage(
        "Cannot connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Request a food donation
  // --------------------------------------------------
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
        `http://127.0.0.1:8000/ngo/request/${donationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setMessage(
          data.detail || "Unable to request this donation"
        );

        return;
      }

      // Request succeeded
      console.log("Rescue mission created:", data);

      // Increase accepted donation count
      setAcceptedCount((count) => count + 1);

      // Remove the requested donation from available list
      setDonations((currentDonations) =>
        currentDonations.filter(
          (donation) => donation.id !== donationId
        )
      );

      alert(
        "Food requested successfully! 🎉\n\nThe donation has been matched to your NGO."
      );
    } catch (error) {
      console.error("Request food error:", error);

      setMessage(
        "Cannot connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setRequestingId(null);
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // --------------------------------------------------
  // Logged-in user
  // --------------------------------------------------
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------
  const totalMeals = donations.reduce(
    (total, donation) =>
      total + Number(donation.quantity || 0),
    0
  );

  return (
    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="dashboard-header">

          <div>

            <p className="eyebrow">
              NGO DASHBOARD
            </p>

            <h1>
              Welcome, {user.name || "NGO"} 🤝
            </h1>

            <p>
              Find surplus food available for your
              community.
            </p>

          </div>

          <button
            className="secondary-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>


        {/* ==========================================
            STATISTICS
        ========================================== */}

        <div className="stats-grid">

          <div className="stat-card">

            <span className="stat-icon">
              🍱
            </span>

            <strong>
              {donations.length}
            </strong>

            <span>
              Available Donations
            </span>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              ♻️
            </span>

            <strong>
              {totalMeals}
            </strong>

            <span>
              Available Meals
            </span>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              🤝
            </span>

            <strong>
              {acceptedCount}
            </strong>

            <span>
              Accepted Donations
            </span>

          </div>


          <div className="stat-card">

            <span className="stat-icon">
              ❤️
            </span>

            <strong>
              0
            </strong>

            <span>
              People Served
            </span>

          </div>

        </div>


        {/* ==========================================
            AVAILABLE DONATIONS
        ========================================== */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Available Food
              </h2>

              <p>
                Surplus food currently available
                for rescue.
              </p>

            </div>


            <button
              className="secondary-btn"
              onClick={fetchDonations}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

          </div>


          {/* Loading */}

          {loading && (
            <div className="empty-state">

              Loading available donations...

            </div>
          )}


          {/* Error */}

          {!loading && message && (
            <div className="empty-state">

              {message}

            </div>
          )}


          {/* No donations */}

          {!loading &&
            !message &&
            donations.length === 0 && (

              <div className="empty-state">

                <div className="empty-icon">
                  🍲
                </div>

                <h3>
                  No food available right now
                </h3>

                <p>
                  New surplus food donations
                  will appear here.
                </p>

              </div>

            )}


          {/* Donation list */}

          {!loading &&
            !message &&
            donations.length > 0 && (

              <div className="donation-list">

                {donations.map((donation) => (

                  <div
                    className="ngo-donation-card"
                    key={donation.id}
                  >

                    {/* Food icon */}

                    <div className="donation-icon">
                      🍱
                    </div>


                    {/* Food information */}

                    <div className="donation-info">

                      <h3>
                        {donation.food_name}
                      </h3>

                      <p>
                        {donation.food_type}
                      </p>

                      <small>
                        Available until:{" "}
                        {new Date(
                          donation.available_until
                        ).toLocaleString()}
                      </small>

                    </div>


                    {/* Quantity */}

                    <div className="donation-quantity">

                      <strong>
                        {donation.quantity}
                      </strong>

                      <span>
                        meals
                      </span>

                    </div>


                    {/* Status */}

                    <div className="donation-status">
                      AVAILABLE
                    </div>


                    {/* Request button */}

                    <button
                      className="primary-btn"
                      onClick={() =>
                        handleRequestFood(
                          donation.id
                        )
                      }
                      disabled={
                        requestingId === donation.id
                      }
                    >
                      {requestingId === donation.id
                        ? "Requesting..."
                        : "Request Food"}
                    </button>

                  </div>

                ))}

              </div>

            )}

        </section>

      </div>

    </div>
  );
}

export default NgoDashboard;
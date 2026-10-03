import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Dashboard.css";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_donations: 0,
    total_meals_offered: 0,
    total_food_saved: 0,
    available_donations: 0,
    accepted_donations: 0,
    delivered_donations: 0,
    total_users: 0,
    donors_count: 0,
    ngos_count: 0,
    volunteers_count: 0,
  });
  const [donations, setDonations] = useState([]);
  const [missions, setMissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("donations");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Stats
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
      if (!statsRes.ok) {
        if (statsRes.status === 401 || statsRes.status === 403) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to load admin stats");
      }
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Donations
      const donationsRes = await fetch(`${API_BASE_URL}/admin/donations`, { headers });
      if (donationsRes.ok) {
        setDonations(await donationsRes.json());
      }

      // Fetch Missions
      const missionsRes = await fetch(`${API_BASE_URL}/admin/missions`, { headers });
      if (missionsRes.ok) {
        setMissions(await missionsRes.json());
      }

      // Fetch Users
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers });
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }

    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.message || "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredDonations = donations.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.food_name.toLowerCase().includes(q) ||
      (d.donor_name && d.donor_name.toLowerCase().includes(q)) ||
      (d.address && d.address.toLowerCase().includes(q)) ||
      (d.status && d.status.toLowerCase().includes(q)) ||
      (d.accepted_by_ngo && d.accepted_by_ngo.toLowerCase().includes(q))
    );
  });

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="dashboard-page admin-dashboard">
      <div className="dashboard-container">
        {/* HEADER */}
        <div className="dashboard-header admin-header">
          <div>
            <p className="eyebrow admin-eyebrow">⚙️ SUPER ADMIN CONTROL CENTER</p>
            <h1>ShareBite Admin Dashboard</h1>
            <p>
              Logged in as <strong>{currentUser.name || "Administrator"}</strong> ({currentUser.email})
            </p>
          </div>
          <div className="admin-header-actions">
            <button className="primary-btn refresh-btn" onClick={fetchAdminData} disabled={loading}>
              {loading ? "Refreshing..." : "🔄 Refresh Data"}
            </button>
            <button className="secondary-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        {/* TOP LEVEL METRICS */}
        <div className="stats-grid admin-stats-grid">
          <div className="stat-card impact-card highlight">
            <span className="stat-icon">🌱</span>
            <strong className="stat-big-value">{stats.total_food_saved}</strong>
            <span className="stat-title">Total Food Saved (Meals)</span>
            <small className="stat-hint">Rescued by verified NGOs</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🍲</span>
            <strong>{stats.total_meals_offered}</strong>
            <span className="stat-title">Total Meals Donated</span>
            <small className="stat-hint">{stats.total_donations} Total Donations</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <strong>{stats.available_donations}</strong>
            <span className="stat-title">Available for Rescue</span>
            <small className="stat-hint">Ready for pickup</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🤝</span>
            <strong>{stats.accepted_donations}</strong>
            <span className="stat-title">Accepted by NGOs</span>
            <small className="stat-hint">Missions currently matched</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon">👥</span>
            <strong>{stats.total_users}</strong>
            <span className="stat-title">Registered Users</span>
            <small className="stat-hint">{stats.donors_count} Donors • {stats.ngos_count} NGOs</small>
          </div>
        </div>

        {/* TABS & SEARCH */}
        <div className="admin-controls-bar">
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === "donations" ? "active" : ""}`}
              onClick={() => setActiveTab("donations")}
            >
              🍱 All Donations ({donations.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "missions" ? "active" : ""}`}
              onClick={() => setActiveTab("missions")}
            >
              🚚 Rescue Missions ({missions.length})
            </button>
            <button
              className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 User Accounts ({users.length})
            </button>
          </div>

          <div className="admin-search">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* DONATIONS TAB */}
        {activeTab === "donations" && (
          <section className="dashboard-section admin-table-section">
            <div className="section-header">
              <div>
                <h2>All Food Donations</h2>
                <p>Real-time audit log of all donations created, their pickup address, and claim status.</p>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Loading donation records...</div>
            ) : filteredDonations.length === 0 ? (
              <div className="empty-state">No donations match your filter.</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Food Item</th>
                      <th>Quantity</th>
                      <th>Donor Details</th>
                      <th>Pickup Address</th>
                      <th>Status</th>
                      <th>Accepted By NGO</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((d) => (
                      <tr key={d.id}>
                        <td><strong>#{d.id}</strong></td>
                        <td>
                          <strong>{d.food_name}</strong>
                          <div className="sub-text">{d.food_type}</div>
                        </td>
                        <td>
                          <span className="quantity-badge">{d.quantity} meals</span>
                        </td>
                        <td>
                          <div>{d.donor_name}</div>
                          <div className="sub-text">{d.donor_email}</div>
                          {d.donor_phone && <div className="sub-text">📞 {d.donor_phone}</div>}
                        </td>
                        <td className="address-cell">
                          <span title={d.address}>📍 {d.address}</span>
                        </td>
                        <td>
                          <span className={`status-pill ${d.status.toLowerCase()}`}>
                            {d.status}
                          </span>
                        </td>
                        <td>
                          {d.accepted_by_ngo ? (
                            <div>
                              <strong style={{ color: "#3b82f6" }}>🤝 {d.accepted_by_ngo}</strong>
                              <div className="sub-text">{d.ngo_email}</div>
                            </div>
                          ) : (
                            <span className="sub-text">— Unclaimed —</span>
                          )}
                        </td>
                        <td>
                          <span className="sub-text">
                            {d.created_at ? new Date(d.created_at).toLocaleString() : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* RESCUE MISSIONS TAB */}
        {activeTab === "missions" && (
          <section className="dashboard-section admin-table-section">
            <div className="section-header">
              <div>
                <h2>Rescue Missions Log</h2>
                <p>Tracking pickups and deliveries coordinated between Donors and NGOs.</p>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Loading rescue missions...</div>
            ) : missions.length === 0 ? (
              <div className="empty-state">No rescue missions recorded yet.</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mission ID</th>
                      <th>Donation #</th>
                      <th>Food Item</th>
                      <th>Quantity</th>
                      <th>Pickup Location</th>
                      <th>Claiming NGO</th>
                      <th>Mission Status</th>
                      <th>Matched At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map((m) => (
                      <tr key={m.id}>
                        <td><strong>M#{m.id}</strong></td>
                        <td>#{m.donation_id}</td>
                        <td><strong>{m.food_name}</strong></td>
                        <td><span className="quantity-badge">{m.quantity} meals</span></td>
                        <td className="address-cell">📍 {m.address}</td>
                        <td>
                          <strong>{m.ngo_name}</strong>
                        </td>
                        <td>
                          <span className={`status-pill ${m.status.toLowerCase()}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>
                          <span className="sub-text">
                            {m.created_at ? new Date(m.created_at).toLocaleString() : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <section className="dashboard-section admin-table-section">
            <div className="section-header">
              <div>
                <h2>Registered Accounts</h2>
                <p>Complete directory of registered donors, NGOs, volunteers, and admins.</p>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Loading user directory...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">No users match your search.</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone || "—"}</td>
                        <td>
                          <span className={`role-pill role-${u.role.toLowerCase()}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className="sub-text">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

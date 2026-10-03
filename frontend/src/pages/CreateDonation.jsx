import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import heroFoodImg from "../assets/hero-food.jpg";
import buffetFoodImg from "../assets/buffet-food.jpg";
import bakeryFoodImg from "../assets/bakery-food.jpg";
import "./CreateDonation.css";

function CreateDonation() {
  const navigate = useNavigate();

  // Helper for current and future ISO strings for datetime-local
  const now = new Date();
  const formatDateTime = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const defaultPrepared = formatDateTime(now);
  const defaultAvailable = formatDateTime(new Date(now.getTime() + 6 * 60 * 60 * 1000));

  const [formData, setFormData] = useState({
    food_name: "",
    food_type: "VEGETARIAN",
    quantity: 50,
    prepared_at: defaultPrepared,
    available_until: defaultAvailable,
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickCategories = [
    { label: "🍛 Biryani & Curry", name: "Fresh Dum Biryani & Gravy", type: "VEGETARIAN" },
    { label: "🥘 Banquet Buffet", name: "Surplus Wedding Banquet Spread", type: "NON_VEGETARIAN" },
    { label: "🥐 Bakery Goods", name: "Artisan Breads & Pastries", type: "VEGETARIAN" },
    { label: "🍲 Rice & Dal Meals", name: "Wholesome Steamed Rice & Dal", type: "VEGETARIAN" },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuickCategory = (cat) => {
    setFormData((prev) => ({
      ...prev,
      food_name: cat.name,
      food_type: cat.type,
    }));
  };

  const handleAddQuantity = (amount) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, (Number(prev.quantity) || 0) + amount),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.food_name.trim()) {
      setError("Please enter what food is being donated.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Please provide a valid pickup address.");
      return;
    }

    if (new Date(formData.available_until) <= new Date(formData.prepared_at)) {
      setError("Available until must be later than the prepared time.");
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("access_token");

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.role !== "DONOR") {
        navigate("/login");
        return;
      }

      const donationData = {
        food_name: formData.food_name.trim(),
        food_type: formData.food_type,
        quantity: Number(formData.quantity),
        prepared_at: formData.prepared_at,
        available_until: formData.available_until,
        address: formData.address.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(donationData),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = "Failed to create donation";
        if (Array.isArray(result.detail)) {
          errorMsg = result.detail[0].msg;
        } else if (result.detail) {
          errorMsg = result.detail;
        }
        throw new Error(errorMsg);
      }

      alert("🎉 Food donation created successfully!\n\nNearby NGOs have been notified for immediate pickup.");
      navigate("/donor");

    } catch (err) {
      console.error("Create donation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preview food photo
  const getPreviewImage = () => {
    const lower = formData.food_name.toLowerCase();
    if (lower.includes("bread") || lower.includes("bakery") || lower.includes("pastry")) return bakeryFoodImg;
    if (formData.food_type === "NON_VEGETARIAN" || lower.includes("buffet")) return buffetFoodImg;
    return heroFoodImg;
  };

  return (
    <main className="create-donation-page">
      <div className="create-donation-container">
        <button className="back-button" onClick={() => navigate("/donor")}>
          ← Back to Portal
        </button>

        <div className="create-donation-layout">
          {/* Form Card */}
          <div className="create-donation-card">
            <div className="create-donation-header">
              <div className="appetite-badge">
                <span>🍱 SHARE SURPLUS FOOD</span>
              </div>
              <h1>List Food for Rescue</h1>
              <p>Turn safe, freshly prepared surplus food into nourishment for local shelters.</p>
            </div>

            {error && <div className="form-error">{error}</div>}

            {/* Quick Templates */}
            <div className="quick-templates-section">
              <label className="section-micro-label">QUICK TEMPLATES</label>
              <div className="templates-scroll">
                {quickCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="template-btn"
                    onClick={() => handleQuickCategory(cat)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Food Name */}
              <div className="form-group">
                <label htmlFor="food_name">Dish Name / Menu Description *</label>
                <input
                  id="food_name"
                  name="food_name"
                  type="text"
                  placeholder="e.g. Royal Vegetable Dum Biryani, Salad & Gravy"
                  value={formData.food_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Food Type (Dietary Radio Cards) */}
              <div className="form-group">
                <label>Dietary Classification *</label>
                <div className="dietary-selector-grid">
                  <div
                    className={`dietary-card ${formData.food_type === "VEGETARIAN" ? "selected veg" : ""}`}
                    onClick={() => setFormData({ ...formData, food_type: "VEGETARIAN" })}
                  >
                    <span className="dietary-icon">🌿</span>
                    <div>
                      <strong>Pure Vegetarian</strong>
                      <small>No meat, fish or poultry</small>
                    </div>
                  </div>

                  <div
                    className={`dietary-card ${formData.food_type === "NON_VEGETARIAN" ? "selected nonveg" : ""}`}
                    onClick={() => setFormData({ ...formData, food_type: "NON_VEGETARIAN" })}
                  >
                    <span className="dietary-icon">🍗</span>
                    <div>
                      <strong>Non-Vegetarian</strong>
                      <small>Contains meat, chicken or egg</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Meals with Quick Increments */}
              <div className="form-group">
                <div className="quantity-label-row">
                  <label htmlFor="quantity">Quantity (Approx. Servings / Meals) *</label>
                  <div className="quick-qty-buttons">
                    <button type="button" onClick={() => handleAddQuantity(10)}>+10</button>
                    <button type="button" onClick={() => handleAddQuantity(25)}>+25</button>
                    <button type="button" onClick={() => handleAddQuantity(50)}>+50</button>
                  </div>
                </div>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  placeholder="50"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Timestamps in 2 Columns */}
              <div className="form-row-two">
                <div className="form-group">
                  <label htmlFor="prepared_at">Prepared At *</label>
                  <input
                    id="prepared_at"
                    name="prepared_at"
                    type="datetime-local"
                    value={formData.prepared_at}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="available_until">Available Until (Expiry) *</label>
                  <input
                    id="available_until"
                    name="available_until"
                    type="datetime-local"
                    value={formData.available_until}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Practical Pickup Address */}
              <div className="form-group address-group">
                <label htmlFor="address">
                  📍 Pickup Address & Landmark *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  placeholder="e.g. Royal Palace Banquet Hall, 88 Brigade Road, Near Metro Pillar 140, Central Zone"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                <small className="form-hint">
                  Include landmarks, entrance gate, or phone contact for smooth volunteer pickup.
                </small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="primary-btn submit-donation-btn"
                disabled={loading}
              >
                {loading ? "Broadcasting to NGOs..." : "🚀 Publish Food Rescue Listing"}
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="live-preview-sidebar">
            <div className="preview-label">LIVE NGO PREVIEW</div>
            <div className="food-rescue-card preview-card">
              <div className="card-thumb-wrap">
                <img src={getPreviewImage()} alt="Preview" className="card-thumb-img" />
                <div className="thumb-meals-badge">
                  <strong>{formData.quantity || 0}</strong> MEALS
                </div>
                <div className="thumb-urgency-badge">⚡ FRESH SURPLUS</div>
              </div>
              <div className="card-content-wrap">
                <div className="card-meta">
                  {formData.food_type === "VEGETARIAN" ? (
                    <span className="badge-veg">100% PURE VEG</span>
                  ) : (
                    <span className="badge-nonveg">NON-VEG</span>
                  )}
                  <span className="card-expiry">Available Today</span>
                </div>
                <h3 className="card-title">
                  {formData.food_name || "Your Dish Name Appears Here"}
                </h3>
                <div className="card-pickup-info">
                  <span className="pickup-pin">📍</span>
                  <p className="pickup-text">
                    {formData.address || "Your pickup address will be displayed here for NGOs."}
                  </p>
                </div>
                <div className="card-action-row">
                  <span className="status-label available">● READY TO RESCUE</span>
                </div>
              </div>
            </div>
            <div className="preview-tip">
              💡 <strong>Instant Notification:</strong> As soon as you publish, nearby verified NGOs receive automated SMS & dashboard alerts.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CreateDonation;
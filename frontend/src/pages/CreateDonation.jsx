import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateDonation() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    food_name: "",
    food_type: "VEGETARIAN",
    quantity: "",
    prepared_at: "",
    available_until: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
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
        food_name: formData.food_name,
        food_type: formData.food_type,
        quantity: Number(formData.quantity),
        prepared_at: formData.prepared_at,
        available_until: formData.available_until,
        latitude: formData.latitude
          ? Number(formData.latitude)
          : null,
        longitude: formData.longitude
          ? Number(formData.longitude)
          : null,
      };

      const response = await fetch(
        "http://127.0.0.1:8000/donations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(donationData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to create donation"
        );
      }

      alert("Donation created successfully! 🎉");

      navigate("/donor");

    } catch (err) {
      console.error("Create donation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-donation-page">

      <div className="create-donation-container">

        <button
          className="back-button"
          onClick={() => navigate("/donor")}
        >
          ← Back to Dashboard
        </button>

        <div className="create-donation-card">

          <div className="create-donation-header">
            <p className="dashboard-label">
              FOOD RESCUE
            </p>

            <h1>
              Create a Food Donation
            </h1>

            <p>
              Tell us about the surplus food you want
              to rescue.
            </p>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Food Name */}

            <div className="form-group">
              <label htmlFor="food_name">
                Food Name
              </label>

              <input
                id="food_name"
                name="food_name"
                type="text"
                placeholder="Example: Vegetable Rice"
                value={formData.food_name}
                onChange={handleChange}
                required
              />
            </div>


            {/* Food Type */}

            <div className="form-group">
              <label htmlFor="food_type">
                Food Type
              </label>

              <select
                id="food_type"
                name="food_type"
                value={formData.food_type}
                onChange={handleChange}
                required
              >
                <option value="VEGETARIAN">
                  Vegetarian
                </option>

                <option value="NON_VEGETARIAN">
                  Non-Vegetarian
                </option>
              </select>
            </div>


            {/* Quantity */}

            <div className="form-group">
              <label htmlFor="quantity">
                Quantity / Meals
              </label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="Example: 100"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>


            {/* Prepared At */}

            <div className="form-group">
              <label htmlFor="prepared_at">
                Prepared At
              </label>

              <input
                id="prepared_at"
                name="prepared_at"
                type="datetime-local"
                value={formData.prepared_at}
                onChange={handleChange}
                required
              />
            </div>


            {/* Available Until */}

            <div className="form-group">
              <label htmlFor="available_until">
                Available Until
              </label>

              <input
                id="available_until"
                name="available_until"
                type="datetime-local"
                value={formData.available_until}
                onChange={handleChange}
                required
              />
            </div>


            {/* Location */}

            <div className="location-section">

              <h3>
                Pickup Location
              </h3>

              <p>
                Optional for now. We will integrate
                maps later.
              </p>

              <div className="location-grid">

                <div className="form-group">
                  <label htmlFor="latitude">
                    Latitude
                  </label>

                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    placeholder="11.0168"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="longitude">
                    Longitude
                  </label>

                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    placeholder="76.9558"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>

              </div>

            </div>


            <button
              type="submit"
              className="submit-donation-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Donation..."
                : "Create Donation"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}

export default CreateDonation;
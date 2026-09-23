function Register() {
  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Create Account</h1>

        <p>Join the FoodRescue community</p>

        <input
          type="text"
          placeholder="Full Name"
        />

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="tel"
          placeholder="Phone Number"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button className="primary-btn">
          Create Account
        </button>

      </div>

    </div>
  );
}

export default Register;
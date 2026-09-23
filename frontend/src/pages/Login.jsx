function Login() {
  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p>Login to your FoodRescue account</p>

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button className="primary-btn">
          Login
        </button>

      </div>

    </div>
  );
}

export default Login;
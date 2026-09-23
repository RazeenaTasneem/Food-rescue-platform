function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">

        <div className="hero-content">
          <p className="tagline">
            RESCUE FOOD • REDUCE WASTE • SERVE COMMUNITIES
          </p>

          <h1>
            Every Meal Deserves
            <span> A Second Chance.</span>
          </h1>

          <p className="hero-description">
            We connect restaurants, event organizers and food donors
            with NGOs and volunteers to rescue surplus food and deliver
            it to people who need it.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              🍱 Donate Food
            </button>

            <button className="secondary-btn">
              🤝 Join as Volunteer
            </button>
          </div>
        </div>

        <div className="hero-card">

          <div className="food-icon">
            🍲
          </div>

          <h3>Today's Impact</h3>

          <div className="impact-number">
            1,250+
          </div>

          <p>Meals rescued by our community</p>

          <div className="impact-row">

            <div>
              <strong>85</strong>
              <span>Donors</span>
            </div>

            <div>
              <strong>42</strong>
              <span>NGOs</span>
            </div>

            <div>
              <strong>126</strong>
              <span>Volunteers</span>
            </div>

          </div>

        </div>

      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">

        <p className="section-label">
          HOW IT WORKS
        </p>

        <h2>
          From Surplus to <span>Service</span>
        </h2>

        <p className="section-description">
          A simple process that turns excess food into meaningful
          community impact.
        </p>

        <div className="steps">

          <div className="step-card">
            <div className="step-icon">🍱</div>
            <h3>Donate</h3>
            <p>
              Restaurants and event organizers list their safe
              surplus food.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">🔗</div>
            <h3>Match</h3>
            <p>
              Nearby NGOs are matched with available donations.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">🚚</div>
            <h3>Rescue</h3>
            <p>
              Volunteers collect the food and transport it to
              the receiving organization.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon">❤️</div>
            <h3>Serve</h3>
            <p>
              Rescued food reaches people and communities who
              need it.
            </p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer id="about">

        <div className="logo">
          Food<span>Rescue</span>
        </div>

        <p>
          Turning surplus food into social impact.
        </p>

        <p className="copyright">
          © 2026 FoodRescue. Built for a better tomorrow.
        </p>

      </footer>
    </>
  );
}

export default Home;
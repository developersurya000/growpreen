import { Link } from 'react-router-dom';

// src/pages/HomePage.jsx
export default function HomePage() {
  return (
    <div className="gp-home">
      <section className="gp-home-hero">
        <div className="gp-home-hero-text">
          <h1>Learn Digital Marketing & earn while you learn</h1>
          <p>
            Join Growpreen’s practical program, complete simple online tasks and
            referrals, and get monthly payouts directly to your UPI.
          </p>

          <div className="gp-home-hero-actions">
            <Link to="/buy" className="gp-btn-primary">
              Join the course
            </Link>
            <Link to="/login" className="gp-btn-secondary">
              Login
            </Link>
          </div>

          <p className="gp-home-hero-note">
            Limited seats. Students from any background can join.
          </p>
        </div>

        <div className="gp-home-hero-card">
          <h3>Your earning preview</h3>
          <ul>
            <li>Daily tasks like reels & simple promotions</li>
            <li>Earn per referral + fixed monthly salary</li>
            <li>Admin verifies tasks within a few hours</li>
          </ul>
          <p className="gp-label">Powered by Growpreen dashboard</p>
        </div>
      </section>

      <section className="gp-home-section">
        <h2>How Growpreen works</h2>
        <div className="gp-home-steps">
          <div className="gp-home-step">
            <span className="gp-step-number">1</span>
            <h3>Enroll in the course</h3>
            <p>
              Buy the Digital Marketing course once and get access to the
              dashboard and tasks.
            </p>
          </div>

          <div className="gp-home-step">
            <span className="gp-step-number">2</span>
            <h3>Complete daily tasks</h3>
            <p>
              Do simple tasks like reels, shares and promotions and submit proofs
              for verification.
            </p>
          </div>

          <div className="gp-home-step">
            <span className="gp-step-number">3</span>
            <h3>Refer friends</h3>
            <p>
              Share your referral link, help them join, and unlock monthly
              salaries like ₹1100 and ₹2200.
            </p>
          </div>

          <div className="gp-home-step">
            <span className="gp-step-number">4</span>
            <h3>Withdraw earnings</h3>
            <p>
              Request withdrawal to your UPI or bank once you reach the minimum
              balance.
            </p>
          </div>
        </div>
      </section>

      <section className="gp-home-section">
        <h2>Why students like Growpreen</h2>
        <div className="gp-home-two-cols">
          <div className="gp-home-box">
            <ul className="gp-list">
              <li>Real earning dashboard, not just theory.</li>
              <li>Admin verifies every task and keeps records.</li>
              <li>Clear monthly targets and salary slabs.</li>
              <li>Simple interface for mobile and desktop.</li>
            </ul>
          </div>

          <div className="gp-home-box">
            <p className="gp-target-text">
              You get both skills and income opportunities in one place, with
              everything tracked inside your account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

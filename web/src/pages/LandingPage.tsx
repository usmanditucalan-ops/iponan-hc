import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

import logo from '../assets/logo.png';

// ── SVG Icon Components (inline to avoid dependency) ──
const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setUserPreference } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-root">
      {/* ── Navbar ── */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <a href="/" className="landing-logo">
          <img src={logo} alt="Logo" className="w-8 h-8 mr-2" />
          Barangay Iponan Health Clinic
        </a>

        <ul className={`landing-nav-links ${mobileMenuOpen ? 'landing-nav-links--open' : ''}`}>
          <li><a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a></li>
          <li><a href="#testimonial" onClick={() => setMobileMenuOpen(false)}>Testimonials</a></li>
          <li><a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
        </ul>

        <div className="landing-nav-ctas">
          <button
            className="landing-theme-toggle"
            onClick={() => setUserPreference(theme === 'light' ? 'dark' : 'light')}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`${theme === 'light' ? 'Dark' : 'Light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <Link to="/login" className="landing-btn landing-btn-ghost">Log In</Link>
          <Link to="/register" className="landing-btn landing-btn-solid">Sign Up</Link>
        </div>

        <button
          className="landing-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-grid">
          <div>
            <div className="landing-hero-badge">
              <CheckIcon /> Trusted by Our Community
            </div>
            <h1 className="landing-hero-title">
              Efficient Healthcare<br />for Our <span>Community.</span>
            </h1>
            <p className="landing-hero-subtitle">
              Book Appointments, Access EMR, and Manage Health Records Securely — all in one modern platform built for Barangay Iponan.
            </p>
            <div className="landing-hero-ctas">
              <Link to="/login" className="landing-btn landing-btn-ghost landing-btn-lg">
                Log In
              </Link>
              <Link to="/register" className="landing-btn landing-btn-solid landing-btn-lg">
                Sign Up Free →
              </Link>
            </div>
            <div className="landing-hero-stats">
              <div className="landing-hero-stat">
                <h4>1,200+</h4>
                <p>Patients Served</p>
              </div>
              <div className="landing-hero-stat">
                <h4>98%</h4>
                <p>Satisfaction Rate</p>
              </div>
              <div className="landing-hero-stat">
                <h4>24/7</h4>
                <p>Digital Access</p>
              </div>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-hero-img-wrap">
              <img
                className="landing-hero-img"
                src="/hero-clinic.svg"
                alt="Medical team providing care at a modern clinic"
                loading="eager"
              />
            </div>
            {/* Floating cards */}
            <div className="landing-hero-float landing-hero-float--top">
              <div className="landing-float-icon landing-float-icon--blue">📅</div>
              <div>
                <strong>Easy Booking</strong>
                <div className="landing-float-sub">Schedule in seconds</div>
              </div>
            </div>
            <div className="landing-hero-float landing-hero-float--bottom">
              <div className="landing-float-icon landing-float-icon--purple">🔒</div>
              <div>
                <strong>Secure Records</strong>
                <div className="landing-float-sub">HIPAA-grade security</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-features" id="features">
        <div className="landing-features-header">
          <div className="landing-section-tag">✦ Features</div>
          <h2 className="landing-section-title">Everything Your Community Clinic Needs</h2>
          <p className="landing-section-subtitle">
            Modern tools designed to simplify healthcare delivery and empower patients with digital access.
          </p>
        </div>

        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon--teal">
              <CalendarIcon />
            </div>
            <h3>Easy Appointments</h3>
            <p>Book clinic appointments with just a few clicks. View available slots, choose your preferred time, and receive instant confirmation.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon--purple">
              <ShieldIcon />
            </div>
            <h3>Secure EMR</h3>
            <p>Access and manage Electronic Medical Records securely. Patient data is encrypted and protected with industry-standard security.</p>
          </div>

          <div className="landing-feature-card">
            <div className="landing-feature-icon landing-feature-icon--pink">
              <HeartIcon />
            </div>
            <h3>Community Health</h3>
            <p>Promote inclusive community health programs, track immunizations, manage prenatal care, and support barangay-level wellness initiatives.</p>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="landing-testimonial" id="testimonial">
        <div className="landing-testimonial-inner">
          <img
            className="landing-testimonial-img"
            src="/testimonial-person.svg"
            alt="Happy patient at the clinic"
            loading="lazy"
          />
          <div>
            <div className="landing-quote-mark">"</div>
            <p className="landing-quote-text">
              "Thank you to this amazing system. It has completely changed how I manage my family's health appointments. Booking is so easy, and I love that I can view my medical records anytime. The staff at Barangay Iponan Health Clinic truly care for their patients' quality of care."
            </p>
            <div className="landing-quote-author">
              <div className="landing-quote-avatar">SN</div>
              <div>
                <div className="landing-quote-name">Sean Nelson</div>
                <div className="landing-quote-role">Patient • Brgy. Iponan Resident</div>
                <div style={{ display: 'flex', gap: 2, color: '#facc15', marginTop: 4 }}>
                  <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <h2>Ready to Get Started?</h2>
          <p>Join hundreds of families in Barangay Iponan who trust our clinic for their healthcare needs.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="landing-btn landing-btn-white landing-btn-lg">
              Create Free Account
            </Link>
            <Link to="/login" className="landing-btn landing-btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer" id="contact">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <h3>
              <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
              Barangay Iponan Health Clinic
            </h3>
            <p>Providing quality, accessible healthcare services to the community of Barangay Iponan, Cagayan de Oro City.</p>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#testimonial">Testimonials</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4>Social</h4>
            <div className="landing-socials">
              <a href="#" className="landing-social-btn" aria-label="Facebook">f</a>
              <a href="#" className="landing-social-btn" aria-label="Twitter">𝕏</a>
              <a href="#" className="landing-social-btn" aria-label="Instagram">◎</a>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 Barangay Iponan Health Clinic. All rights reserved.</span>
          <span>Powered by EMR System</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

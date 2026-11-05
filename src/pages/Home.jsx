import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  Lock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  BarChart3,
  Layers,
  Sparkles,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import Button from '../components/common/Button';

const CURRENT_YEAR = new Date().getFullYear();

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, logout, availableAgents } = useAuthContext();
  const { addToast } = useNotificationContext() || {};

  const [loginMode, setLoginMode] = useState('agent'); // 'agent' | 'credentials'
  const [selectedAgentId, setSelectedAgentId] = useState(availableAgents[0]?.id || 'agt-1');
  const [email, setEmail] = useState('jordan.lee@supportdesk.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleAgentSelect = (agentId) => {
    setSelectedAgentId(agentId);
    const agent = availableAgents.find(a => a.id === agentId);
    if (agent) {
      setEmail(agent.email);
    }
    setFormError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      let loggedInUser;
      if (loginMode === 'agent') {
        loggedInUser = await login({ agentId: selectedAgentId });
      } else {
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid work email address.');
        }
        loggedInUser = await login({ email: email.trim(), password });
      }

      if (addToast) {
        addToast(`Welcome back, ${loggedInUser.name}! Opening Executive Dashboard...`, 'success');
      }

      // Open dashboard upon successful login
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSignOutUser = () => {
    logout();
    if (addToast) {
      addToast('Signed out of support session', 'info');
    }
  };

  return (
    <div className="home-page-container">
      {/* Top Navigation */}
      <header className="home-navbar">
        <div className="home-nav-inner">
          <div className="home-brand">
            <img src="/assets/logo.svg" alt="Applen Solutions Logo" className="home-logo" />
            <span className="home-brand-tag">CSTMS v2.4</span>
          </div>

          <nav className="home-nav-links">
            <a href="#features" className="home-nav-link">Platform Features</a>
            <a href="#sla" className="home-nav-link">SLA Engine</a>
            <a href="#telemetry" className="home-nav-link">Live Telemetry</a>
          </nav>

          <div className="home-nav-actions">
            {isAuthenticated ? (
              <div className="home-user-logged-box">
                <span className="home-logged-greeting">
                  Signed in as <strong>{user.name}</strong>
                </span>
                <Button variant="primary" size="sm" icon={<ArrowRight size={14} />} onClick={handleContinueToDashboard}>
                  Open Dashboard
                </Button>
                <Button variant="secondary" size="sm" onClick={handleSignOutUser}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <a href="#login-card" className="home-nav-signin-btn">
                <LogIn size={15} />
                <span>Agent Login</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="home-hero-bg-glow" />
        <div className="home-hero-content">
          <div className="home-hero-left">
            <div className="hero-badge">
              <Sparkles size={14} className="hero-badge-icon" />
              <span>APPLEN SOLUTIONS ENTERPRISE OPERATIONS</span>
            </div>

            <h1 className="hero-title">
              Mission-Critical <span className="hero-gold-text">Customer Ticket</span> & SLA Intelligence
            </h1>

            <p className="hero-subtitle">
              Engineered for high-velocity customer support and technical resolution teams.
              Automate multi-tier SLA deadlines, enforce strict finite state transitions,
              partition public conversation from confidential audit notes, and monitor live workloads in real time.
            </p>

            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="hero-stat-val">99.98%</div>
                <div className="hero-stat-label">SLA Compliance Met</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-val">&lt; 15m</div>
                <div className="hero-stat-label">Avg First Response</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-val">4,500+</div>
                <div className="hero-stat-label">Resolved Inquiries</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-val">100%</div>
                <div className="hero-stat-label">Audit Traceability</div>
              </div>
            </div>

            <div className="hero-features-chips">
              <span className="hero-chip"><ShieldCheck size={14} /> Strict State Machine</span>
              <span className="hero-chip"><Lock size={14} /> Air-Gapped Internal Notes</span>
              <span className="hero-chip"><Clock size={14} /> Dynamic Priority SLAs</span>
              <span className="hero-chip"><BarChart3 size={14} /> Recharts Telemetry</span>
            </div>
          </div>

          {/* Right Column: Interactive Login Console Card */}
          <div id="login-card" className="home-hero-right">
            <div className="login-card-surface">
              <div className="login-card-header">
                <div className="login-header-icon-box">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="login-card-title">Support Console Sign In</h2>
                  <p className="login-card-subtitle">Authenticate to access live tickets and telemetry</p>
                </div>
              </div>

              {isAuthenticated ? (
                /* Already Authenticated View */
                <div className="already-authenticated-panel">
                  <div className="auth-profile-box">
                    <img src={user.avatar} alt={user.name} className="auth-avatar" />
                    <div>
                      <div className="auth-name">{user.name}</div>
                      <div className="auth-role">{user.role}</div>
                      <div className="auth-email">{user.email}</div>
                    </div>
                  </div>
                  <p className="auth-session-notice">
                    You currently have an active authenticated session. Ready to proceed to the management console?
                  </p>
                  <div className="auth-actions-group">
                    <Button
                      variant="primary"
                      className="auth-launch-btn"
                      icon={<ArrowRight size={16} />}
                      onClick={handleContinueToDashboard}
                    >
                      Open Executive Dashboard
                    </Button>
                    <Button variant="secondary" onClick={handleSignOutUser}>
                      Switch User / Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                /* Login Form */
                <form className="login-form" onSubmit={handleLoginSubmit}>
                  {/* Mode Tabs */}
                  <div className="login-mode-tabs">
                    <button
                      type="button"
                      className={`login-mode-tab ${loginMode === 'agent' ? 'active' : ''}`}
                      onClick={() => setLoginMode('agent')}
                    >
                      <UserCheck size={14} />
                      <span>Select Agent Profile</span>
                    </button>
                    <button
                      type="button"
                      className={`login-mode-tab ${loginMode === 'credentials' ? 'active' : ''}`}
                      onClick={() => setLoginMode('credentials')}
                    >
                      <LogIn size={14} />
                      <span>Work Credentials</span>
                    </button>
                  </div>

                  {formError && (
                    <div className="login-error-alert" role="alert">
                      <AlertCircle size={16} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {loginMode === 'agent' ? (
                    <div className="agent-selection-container">
                      <label className="field-label">Select Active Support Engineer</label>
                      <div className="agent-cards-grid">
                        {availableAgents.map((agent) => {
                          const isSelected = selectedAgentId === agent.id;
                          return (
                            <div
                              key={agent.id}
                              className={`agent-login-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleAgentSelect(agent.id)}
                              role="button"
                              tabIndex={0}
                            >
                              <img src={agent.avatar} alt={agent.name} className="agent-item-avatar" />
                              <div className="agent-item-details">
                                <div className="agent-item-name">{agent.name}</div>
                                <div className="agent-item-role">{agent.role}</div>
                                <div className="agent-item-email">{agent.email}</div>
                              </div>
                              {isSelected && (
                                <div className="agent-selected-check">
                                  <CheckCircle2 size={16} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="credentials-fields-group">
                      <div className="form-field">
                        <label className="field-label" htmlFor="work-email">Enterprise Work Email</label>
                        <input
                          id="work-email"
                          type="email"
                          className="text-input"
                          placeholder="agent@supportdesk.internal"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field">
                        <label className="field-label" htmlFor="work-pass">Security Password</label>
                        <div className="password-input-wrapper">
                          <input
                            id="work-pass"
                            type={showPassword ? 'text' : 'password'}
                            className="text-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="toggle-password-btn"
                            onClick={() => setShowPassword(p => !p)}
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="login-action-wrapper">
                    <Button
                      type="submit"
                      variant="primary"
                      className="login-submit-btn"
                      loading={submitting}
                      icon={<ArrowRight size={16} />}
                    >
                      {submitting ? 'Authenticating...' : 'Sign In & Open Dashboard'}
                    </Button>
                  </div>

                  <div className="login-security-notice">
                    <Lock size={12} />
                    <span>Protected by APPLEN TLS 1.3 & Session Token Enforcer</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section id="features" className="home-features-section">
        <div className="home-section-header">
          <span className="section-pill">SYSTEM ARCHITECTURE</span>
          <h2 className="section-title">Built for Mission-Critical Support Standards</h2>
          <p className="section-subtitle">
            Eliminate missed SLAs and fragmented correspondence with our integrated workflow infrastructure.
          </p>
        </div>

        <div className="features-grid-4">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <Clock size={22} />
            </div>
            <h3 className="feature-card-title">Dynamic SLA Engine</h3>
            <p className="feature-card-desc">
              Automatic SLA deadline computation based on priority tier (Urgent 24h, High 48h, Medium 72h, Low 120h)
              with visual overdue escalation pills.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <Layers size={22} />
            </div>
            <h3 className="feature-card-title">Workflow State Machine</h3>
            <p className="feature-card-desc">
              Strict transition enforcement preventing illegal status leaps. Open tickets progress seamlessly to
              In Progress or Resolved, with dedicated one-click reopening.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <Lock size={22} />
            </div>
            <h3 className="feature-card-title">Air-Gapped Internal Notes</h3>
            <p className="feature-card-desc">
              Customer correspondence is strictly isolated from confidential staff audit notes.
              Engineering traces and reproduction logs remain confidential.
            </p>
          </div>

          {/* Card 4 */}
          <div className="feature-card">
            <div className="feature-icon-box">
              <BarChart3 size={22} />
            </div>
            <h3 className="feature-card-title">Executive Telemetry</h3>
            <p className="feature-card-desc">
              Real-time Recharts data visualisations calculating status distributions, priority volume bars,
              and agent workload capacity with zero hardcoded values.
            </p>
          </div>
        </div>
      </section>

      {/* SLA Policy Section */}
      <section id="sla" className="home-sla-section">
        <div className="sla-card-wrapper">
          <div className="sla-text-col">
            <span className="section-pill">SLA COMMITMENT MATRIX</span>
            <h2 className="sla-title">Guaranteed Response Times with Escalation Telemetry</h2>
            <p className="sla-desc">
              Our service level agreement matrix dynamically binds resolution deadlines directly to customer ticket records,
              dispatching local notifications as deadlines approach.
            </p>
            <div className="sla-table-summary">
              <div className="sla-row">
                <span className="sla-tag urgent">URGENT</span>
                <span className="sla-hours">24 Hours SLA</span>
                <span className="sla-meta">Critical Outage / Revenue Blocker</span>
              </div>
              <div className="sla-row">
                <span className="sla-tag high">HIGH</span>
                <span className="sla-hours">48 Hours SLA</span>
                <span className="sla-meta">Degraded Performance / Integration Error</span>
              </div>
              <div className="sla-row">
                <span className="sla-tag medium">MEDIUM</span>
                <span className="sla-hours">72 Hours SLA</span>
                <span className="sla-meta">General Operational Requests</span>
              </div>
              <div className="sla-row">
                <span className="sla-tag low">LOW</span>
                <span className="sla-hours">120 Hours (5 Days)</span>
                <span className="sla-meta">Feature Inquiries & Documentation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Telemetry Live Banner */}
      <section id="telemetry" className="home-telemetry-banner">
        <div className="telemetry-banner-content">
          <div>
            <h3 className="telemetry-banner-title">Ready to oversee support operations?</h3>
            <p className="telemetry-banner-desc">
              Authenticate into the APPLEN SOLUTIONS support desk console to manage incoming customer tickets.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => {
              if (isAuthenticated) {
                navigate('/dashboard');
              } else {
                const el = document.getElementById('login-card');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {isAuthenticated ? 'Open Executive Dashboard' : 'Sign In to Support Console'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="footer-left">
            <img src="/assets/logo.svg" alt="Applen Solutions" className="footer-logo" />
            <p className="footer-copy">
              © {CURRENT_YEAR} APPLEN SOLUTIONS. All rights reserved. Enterprise Support Management Platform.
            </p>
          </div>
          <div className="footer-status-indicator">
            <span className="status-live-dot" />
            <span className="status-live-text">System Operational — Port 3001 Connected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import GsapClient from './components/GsapClient';

export const metadata = {
  title: "byheart — Shaped by a Love Story",
  description:
    "Discover how care and connection can transform your journey ahead. A second chance at life — one selfless gift can rewrite futures and save lives.",
  openGraph: {
    title: "byheart — Shaped by a Love Story",
    description: "Discover how care and connection can transform your journey ahead.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <GsapClient />

      <div className="bh-page">
        <div className="bh-atmosphere" aria-hidden="true">
          <div className="bh-orb bh-orb--cyan" />
          <div className="bh-orb bh-orb--magenta" />
          <div className="bh-orb bh-orb--amber" />
          <div className="bh-grain" />
        </div>

        <header className="bh-header">
          <a href="/" className="bh-logo">
            <span className="bh-logo-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                <path
                  d="M16 27c-6.5-4.2-10.5-8.6-10.5-13.2C5.5 9.2 8.8 6 12.6 6c2.1 0 3.9 1 5.4 2.7C19.5 7 21.3 6 23.4 6c3.8 0 7.1 3.2 7.1 7.8C30.5 18.4 26.5 22.8 16 27Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.2 12.5c1.6-1.8 3.4-2.7 4.8-1.4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="bh-logo-text">byheart</span>
          </a>

          <nav className="bh-nav" aria-label="Primary">
            <a href="#story" className="bh-nav-link">Story</a>
            <a href="#impact" className="bh-nav-link">Impact</a>
            <a href="#future" className="bh-nav-link">Future</a>
            <button className="bh-nav-grid" aria-label="Open menu" type="button">
              <span /><span /><span />
              <span /><span /><span />
              <span /><span /><span />
            </button>
          </nav>
        </header>

        <aside className="bh-social" aria-label="Social links">
          <a href="#" className="bh-social-link" aria-label="Instagram">IG</a>
          <a href="#" className="bh-social-link" aria-label="LinkedIn">IN</a>
          <a href="#" className="bh-social-link" aria-label="YouTube">YT</a>
        </aside>

        <main className="bh-hero" id="story">
          <div className="bh-hero-copy">
            <h1 className="bh-headline bh-reveal">
              <span>Shaped</span>
              <span>by a</span>
              <span>Love</span>
              <span>Story</span>
            </h1>

            <p className="bh-subhead bh-reveal">
              Discover how care and connection can transform your journey ahead.
            </p>

            <a href="#impact" className="bh-cta bh-reveal">
              <span className="bh-cta-label">Get Started</span>
              <span className="bh-cta-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>

            <div className="bh-orbit-badge bh-reveal" aria-hidden="true">
              <div className="bh-orbit-ring" />
              <img src="/figma/heart-badge.png" alt="" className="bh-orbit-heart" width="72" height="72" />
            </div>
          </div>

          <div className="bh-hero-visual">
            <div className="bh-heart-stage bh-reveal">
              <img
                src="/figma/heart-visual-web.png"
                alt="Translucent anatomical heart with cyan and magenta glow"
                className="bh-heart-img"
                width="1400"
                height="1576"
              />
              <button className="bh-play" type="button" aria-label="Play story video">
                <span className="bh-play-ring" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 7.5v9l8-4.5-8-4.5Z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <article className="bh-card bh-card--improving bh-float" id="impact">
              <div className="bh-card-top">
                <span>Improving</span>
                <span className="bh-card-trend" aria-hidden="true">↑</span>
              </div>
              <div className="bh-gauge" aria-hidden="true">
                <svg viewBox="0 0 120 70" className="bh-gauge-svg">
                  <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" strokeLinecap="round" />
                  <path d="M10 60 A50 50 0 0 1 95 22" fill="none" stroke="url(#bhGauge)" strokeWidth="6" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="bhGauge" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5cf0c8" />
                      <stop offset="100%" stopColor="#ffe27a" />
                    </linearGradient>
                  </defs>
                </svg>
                <strong className="bh-card-value">85%</strong>
              </div>
            </article>

            <article className="bh-card bh-card--bpm bh-float">
              <div className="bh-card-top">
                <span>Latest Test</span>
                <span className="bh-card-trend" aria-hidden="true">↑</span>
              </div>
              <strong className="bh-card-value bh-card-value--lg">42.5 <em>bpm</em></strong>
              <svg className="bh-spark" viewBox="0 0 160 36" aria-hidden="true">
                <path
                  d="M0 24 C18 24 22 8 36 8 S54 28 70 22 92 4 108 12 128 30 160 18"
                  fill="none"
                  stroke="#6dff9a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </article>
          </div>

          <aside className="bh-secondary" id="future">
            <img src="/figma/heart-badge.png" alt="" className="bh-secondary-thumb" width="56" height="56" />
            <div>
              <h2 className="bh-secondary-title">A Second Chance at Life</h2>
              <p className="bh-secondary-copy">
                One selfless gift can rewrite futures and save lives.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}

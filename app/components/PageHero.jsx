export default function PageHero({ eyebrow, title, subtitle, actions }) {
  return (
    <section className="dgs-page-hero">
      <div className="dgs-page-hero-bg" aria-hidden="true">
        <div className="dgs-page-hero-orb" />
        <div className="dgs-hero-grain" />
      </div>
      <div className="dgs-container">
        <div className="dgs-page-hero-content dgs-reveal is-visible">
          {eyebrow ? <span className="dgs-section-label">{eyebrow}</span> : null}
          <h1 className="dgs-page-hero-title">{title}</h1>
          {subtitle ? <p className="dgs-page-hero-subtitle">{subtitle}</p> : null}
          {actions ? <div className="dgs-hero-actions">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}

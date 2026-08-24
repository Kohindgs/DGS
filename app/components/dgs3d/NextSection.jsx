// Minimal "first content experience" that the spatial scroll transition
// resolves into. Uses verbatim WordPress homepage copy (H2 + its four H3
// items). This is NOT the full services section (approval pending).
const SYSTEMS = [
  { name: "Search", wp: "Search Visibility & AI Discovery", tone: "dgs-sys--cyan" },
  { name: "Creative", wp: "Branding, Content & AI Production", tone: "dgs-sys--coral" },
  { name: "Technology", wp: "Website Development & AMC", tone: "dgs-sys--purple" },
  { name: "AI", wp: "Social Media & Performance Marketing", tone: "dgs-sys--yellow" },
];

export default function NextSection() {
  return (
    <section className="dgs-next" id="dgs-v1215-services" aria-label="Capabilities">
      <div className="dgs-next__label">One connected DGS system</div>
      {/* Exact WordPress H2 */}
      <h2>
        One team for <span className="hl">search</span>, web, creative, performance and AI
        production.
      </h2>
      <div className="dgs-sys-grid">
        {SYSTEMS.map((s, i) => (
          <div key={s.name} className={`dgs-sys ${s.tone}`}>
            <div className="num">{String(i + 1).padStart(2, "0")}</div>
            <h3>{s.name}</h3>
            <p>{s.wp}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

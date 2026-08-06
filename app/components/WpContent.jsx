export default function WpContent({ html, className = '' }) {
  if (!html) return null;
  return (
    <div
      className={`dgs-wp-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

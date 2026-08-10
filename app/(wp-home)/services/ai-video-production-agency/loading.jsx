/**
 * Instant dark shell while the AI Production mirror streams in.
 * Prevents a long black void with no feedback.
 */
export default function AiProductionLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#020202',
        color: '#e8e8e6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: "Syne, system-ui, sans-serif",
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2px solid rgba(253,92,98,0.25)',
          borderTopColor: '#FD5C62',
          animation: 'dgs-ai-spin 0.8s linear infinite',
        }}
      />
      <p style={{ margin: 0, fontSize: 15, fontWeight: 500, letterSpacing: '0.02em' }}>
        Loading AI Video Production…
      </p>
      <style>{`@keyframes dgs-ai-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

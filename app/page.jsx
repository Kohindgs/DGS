"use client";

export default function Page() {
  return (
    <main className="hero-container">
      <h1 className="title">Welcome to DGS</h1>
      <p className="subtitle">
        Your Next.js application is successfully deployed and running. 
        Experience the power of modern web development.
      </p>
      <button className="cta-button" onClick={() => alert('Welcome aboard!')}>
        Get Started
      </button>
    </main>
  );
}

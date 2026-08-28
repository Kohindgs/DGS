import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>Page not found</p>
      <Link href="/">Return home</Link>
    </main>
  );
}

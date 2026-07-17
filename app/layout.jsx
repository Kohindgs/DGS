import './globals.css';

export const metadata = {
  title: 'DGS Next.js App',
  description: 'A beautiful demo page built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

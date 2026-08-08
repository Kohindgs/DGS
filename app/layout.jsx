export const metadata = {
  metadataBase: new URL('https://www.dgeniussolutions.com'),
  other: {
    'color-scheme': 'dark',
  },
};

/**
 * Dark canvas on <html>/<body> so Slow-4G / Lighthouse filmstrips never flash
 * white before page CSS streams (page styles land in <body> under App Router).
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      style={{ backgroundColor: '#020202', colorScheme: 'dark' }}
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html,body{background:#020202!important;color-scheme:dark;margin:0;padding:0;color:#e8e8e6}',
          }}
        />
      </head>
      <body style={{ backgroundColor: '#020202', margin: 0, color: '#e8e8e6' }}>
        {children}
      </body>
    </html>
  );
}

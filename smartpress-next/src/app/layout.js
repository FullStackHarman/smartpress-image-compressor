import './globals.css';

export const metadata = {
  title: 'SmartPress | Privacy-First Image Compressor & WebP Converter',
  description: 'Pro-level image compression with 100% client-side privacy. Optimize for Instagram, Shopify, and more without uploading to any server.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}

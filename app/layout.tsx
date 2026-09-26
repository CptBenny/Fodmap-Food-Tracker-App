import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'FODMAP Food Tracker',
  description: 'FODMAP Food Tracker with food components, recipes, Bristol stool logging, and analytical correlation.',
  openGraph: {
    title: 'FODMAP Food Tracker',
    description: 'FODMAP Food Tracker with food components, recipes, Bristol stool logging, and analytical correlation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FODMAP Food Tracker',
    description: 'FODMAP Food Tracker with food components, recipes, Bristol stool logging, and analytical correlation.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className="w-full h-full overflow-hidden">
      <body suppressHydrationWarning className="w-full h-full overflow-hidden m-0 p-0">{children}</body>
    </html>
  );
}


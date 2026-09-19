import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'IBS & Food Intolerance Tracker',
  description: 'Self-contained IBS symptom and food intolerance tracker with Bristol stool logging, FODMAP analysis, Gemini label OCR, and interactive analytics.',
  openGraph: {
    title: 'IBS & Food Intolerance Tracker',
    description: 'Self-contained IBS symptom and food intolerance tracker with Bristol stool logging, FODMAP analysis, Gemini label OCR, and interactive analytics.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IBS & Food Intolerance Tracker',
    description: 'Self-contained IBS symptom and food intolerance tracker with Bristol stool logging, FODMAP analysis, Gemini label OCR, and interactive analytics.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

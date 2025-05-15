import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start-2p',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lab Escape',
  description: 'A pixel art web game set in a sci-fi lab.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable} dark`}> {/* Apply font variable and dark theme default */}
      <body className={`font-sans antialiased`}> {/* Tailwind's font-sans will use the variable */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}

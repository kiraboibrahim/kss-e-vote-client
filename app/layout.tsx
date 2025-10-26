import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: 'KSS E-Voting System | Kibuli Secondary School',
    description: 'Secure and transparent digital voting platform for Kibuli Secondary School student leadership elections. Cast your vote for Head Boy, Head Girl, Sports Captain, and other positions in a safe, efficient, and modern electoral system.',
    keywords: [
        'Kibuli Secondary School',
        'KSS',
        'student elections',
        'e-voting',
        'digital voting',
        'school leadership',
        'student council',
        'online voting',
        'Uganda schools',
        'student democracy'
    ],
    authors: [{ name: 'Kibuli Secondary School' }],
    creator: 'Kibuli Secondary School ICT Department',
    publisher: 'Kibuli Secondary School',
    applicationName: 'KSS E-Voting System',

    // Open Graph metadata for social sharing
    openGraph: {
        title: 'KSS E-Voting System - Student Leadership Elections',
        description: 'Secure and transparent digital voting for Kibuli Secondary School student elections. Vote for your preferred candidates online.',
        siteName: 'KSS E-Voting System',
        locale: 'en_UG',
        type: 'website',
    },

    // Twitter Card metadata
    twitter: {
        card: 'summary_large_image',
        title: 'KSS E-Voting System',
        description: 'Secure digital voting platform for Kibuli Secondary School student elections.',
    },

    // Viewport and theme settings
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
    },
    // Robot instructions
    robots: {
        index: false, // Don't index voting system for privacy
        follow: false,
        nocache: true,
    },

    category: 'Education',
    classification: 'Educational Voting System',
};
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}

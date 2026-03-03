import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://paletteai.app'),
    title: 'PaletteAI',
    description: 'Enter a keyword or upload an image to generate a palette.',
    keywords: ['color palette', 'AI', 'design tool', 'color generator', 'palette generator'],
    openGraph: {
        title: 'PaletteAI',
        description: 'Enter a keyword or upload an image to generate a palette.',
        url: 'https://paletteai.app',
        siteName: 'PaletteAI',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'PaletteAI – AI-Powered Color Palette Generator',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PaletteAI',
        description: 'Enter a keyword or upload an image to generate a palette.',
        images: ['/og-image.png'],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 2500,
                            style: {
                                background: '#1a1a2e',
                                color: '#f0f0f5',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                            },
                        }}
                    />
                    <Navbar />
                    <main>{children}</main>
                    <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
                        <span>PaletteAI</span>
                        <span>Powered by Microsoft Azure &amp; MongoDB</span>
                    </footer>
                </AuthProvider>
            </body>
        </html>
    );
}

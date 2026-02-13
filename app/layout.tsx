import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata: Metadata = {
    title: 'PaletteAI — AI-Powered Color Palette Generator',
    description: 'Generate beautiful, harmonized color palettes using AI. Describe a mood, upload an image, or create manually. Built with Next.js, MongoDB, and Azure.',
    keywords: ['color palette', 'AI', 'design tool', 'color generator', 'palette generator'],
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <html lang="en">
            <body>
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
            </body>
        </html>
    );
}

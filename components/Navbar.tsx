'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, Sparkles, LayoutGrid } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar(): React.JSX.Element {
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <Palette size={22} />
                    </div>
                    <span className={styles.logoText}>PaletteAI</span>
                </Link>

                <div className={styles.links}>
                    <Link
                        href="/generate"
                        className={`${styles.link} ${pathname === '/generate' ? styles.active : ''}`}
                    >
                        <Sparkles size={16} />
                        <span>Generate</span>
                    </Link>
                    <Link
                        href="/gallery"
                        className={`${styles.link} ${pathname === '/gallery' ? styles.active : ''}`}
                    >
                        <LayoutGrid size={16} />
                        <span>Gallery</span>
                    </Link>
                </div>

                <Link href="/generate" className={`btn btn-primary ${styles.cta}`}>
                    <Sparkles size={16} />
                    Create Palette
                </Link>
            </div>
        </nav>
    );
}

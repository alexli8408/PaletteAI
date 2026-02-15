'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Palette, Sparkles, LayoutGrid, LogOut, LogIn } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar(): React.JSX.Element {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                        <span>Saved Palettes</span>
                    </Link>
                </div>

                {/* Auth section */}
                <div className={styles.authSection}>
                    {status === 'loading' && (
                        <div className={styles.authSkeleton} />
                    )}

                    {status === 'unauthenticated' && (
                        <button
                            className={`btn btn-primary ${styles.signInBtn}`}
                            onClick={() => signIn('google')}
                        >
                            <LogIn size={16} />
                            Sign In
                        </button>
                    )}

                    {status === 'authenticated' && session?.user && (
                        <div className={styles.userMenu} ref={menuRef}>
                            <button
                                className={styles.avatarBtn}
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="User menu"
                            >
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        width={34}
                                        height={34}
                                        className={styles.avatar}
                                    />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {session.user.name?.charAt(0) || '?'}
                                    </div>
                                )}
                            </button>

                            {menuOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <span className={styles.dropdownName}>{session.user.name}</span>
                                        <span className={styles.dropdownEmail}>{session.user.email}</span>
                                    </div>
                                    <div className={styles.dropdownDivider} />
                                    <button
                                        className={styles.dropdownItem}
                                        onClick={() => signOut()}
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

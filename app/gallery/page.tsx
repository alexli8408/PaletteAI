'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter } from 'lucide-react';
import PaletteCard from '@/components/PaletteCard';
import type { Palette } from '@/types';
import styles from './page.module.css';

export default function GalleryPage(): React.JSX.Element {
    const { data: session, status: authStatus } = useSession();
    const [palettes, setPalettes] = useState<Palette[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');

    useEffect(() => {
        if (authStatus === 'loading') return;
        if (authStatus === 'authenticated') fetchPalettes();
        else setIsLoading(false);
    }, [authStatus]);

    const fetchPalettes = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (search) params.append('search', search);

            const res = await fetch(`/api/palettes?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            setPalettes(data.palettes || []);
        } catch {
            setPalettes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        fetchPalettes();
    };

    return (
        <div className={`page ${styles.page}`}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Saved</h1>
                </div>

                {authStatus === 'unauthenticated' && (
                    <div className={styles.infoBanner}>
                        🔒 Sign in to save and view your palettes.
                    </div>
                )}

                {authStatus === 'authenticated' && (
                    <>
                        <div className={styles.controls}>
                            <form className={styles.searchForm} onSubmit={handleSearch}>
                                <Search size={18} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    className={`input ${styles.searchInput}`}
                                    placeholder="Search your palettes..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>
                        </div>

                        {isLoading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner} />
                                <p>Loading your palettes...</p>
                            </div>
                        ) : palettes.length > 0 ? (
                            <div className={styles.grid}>
                                {palettes.map((palette, i) => (
                                    <PaletteCard
                                        key={palette._id || i}
                                        palette={palette}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                <Filter size={48} />
                                <h3>No palettes yet</h3>
                                <p>Generate and save some palettes to see them here!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

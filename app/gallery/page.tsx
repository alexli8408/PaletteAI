'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, Filter } from 'lucide-react';
import PaletteCard from '@/components/PaletteCard';
import { generateRandomPalette } from '@/lib/palette-utils';
import type { Palette } from '@/types';
import styles from './page.module.css';

type SortOption = 'recent' | 'trending';

export default function GalleryPage(): React.JSX.Element {
    const [palettes, setPalettes] = useState<Palette[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sort, setSort] = useState<SortOption>('recent');
    const [search, setSearch] = useState<string>('');
    const [useFallback, setUseFallback] = useState<boolean>(false);

    useEffect(() => {
        fetchPalettes();
    }, [sort]);

    const fetchPalettes = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ sort, limit: '20' });
            if (search) params.append('search', search);

            const res = await fetch(`/api/palettes?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            if (data.palettes && data.palettes.length > 0) {
                setPalettes(data.palettes);
                setUseFallback(false);
            } else {
                loadDemoPalettes();
            }
        } catch {
            loadDemoPalettes();
        } finally {
            setIsLoading(false);
        }
    };

    const loadDemoPalettes = (): void => {
        const demoNames = [
            'Sunset Boulevard', 'Ocean Depths', 'Forest Canopy', 'Candy Shop',
            'Midnight Jazz', 'Autumn Harvest', 'Spring Blossom', 'Neon Nights',
            'Desert Sand', 'Arctic Ice', 'Tropical Paradise', 'Lavender Fields',
        ];
        const demoMoods = [
            'warm', 'ocean', 'forest', 'candy',
            'midnight', 'autumn', 'spring', 'neon',
            'earthy', 'cool', 'tropical', 'romantic',
        ];

        const demos: Palette[] = demoNames.map((name, i) => ({
            name,
            colors: generateRandomPalette(),
            mood: demoMoods[i],
            source: 'ai' as const,
            likes: Math.floor(Math.random() * 80) + 5,
            tags: [],
            createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        }));
        setPalettes(demos);
        setUseFallback(true);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        fetchPalettes();
    };

    const handleLike = async (id: string): Promise<void> => {
        if (!id) return;
        try {
            await fetch(`/api/palettes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'like' }),
            });
            setPalettes((prev) =>
                prev.map((p) => (p._id === id ? { ...p, likes: p.likes + 1 } : p))
            );
        } catch {
            // Ignore
        }
    };

    return (
        <div className={`page ${styles.page}`}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Palette Gallery</h1>
                    <p className={styles.subtitle}>Browse and discover beautiful color palettes</p>
                </div>

                <div className={styles.controls}>
                    <form className={styles.searchForm} onSubmit={handleSearch}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={`input ${styles.searchInput}`}
                            placeholder="Search palettes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className={styles.sortBtns}>
                        <button
                            className={`${styles.sortBtn} ${sort === 'recent' ? styles.sortActive : ''}`}
                            onClick={() => setSort('recent')}
                        >
                            <Clock size={14} />
                            Recent
                        </button>
                        <button
                            className={`${styles.sortBtn} ${sort === 'trending' ? styles.sortActive : ''}`}
                            onClick={() => setSort('trending')}
                        >
                            <TrendingUp size={14} />
                            Trending
                        </button>
                    </div>
                </div>

                {useFallback && (
                    <div className={styles.infoBanner}>
                        ✨ Showing demo palettes. Save palettes from the generator to see them here!
                    </div>
                )}

                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Loading palettes...</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {palettes.map((palette, i) => (
                            <PaletteCard
                                key={palette._id || i}
                                palette={palette}
                                onLike={handleLike}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && palettes.length === 0 && (
                    <div className={styles.empty}>
                        <Filter size={48} />
                        <h3>No palettes found</h3>
                        <p>Try a different search or generate some palettes first!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

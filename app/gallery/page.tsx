'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import PaletteCard from '@/components/PaletteCard';
import type { Palette } from '@/types';
import styles from './page.module.css';

export default function GalleryPage(): React.JSX.Element {
    const { data: session, status: authStatus } = useSession();
    const [palettes, setPalettes] = useState<Palette[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (authStatus === 'loading') return;
        fetchPalettes();
    }, [authStatus]);

    // Extract liked palette IDs from fetched data
    useEffect(() => {
        if (session?.user?.id && palettes.length > 0) {
            const liked = new Set<string>();
            for (const p of palettes) {
                if (p._id && p.likedBy?.includes(session.user.id)) {
                    liked.add(p._id);
                }
            }
            setLikedIds(liked);
        }
    }, [palettes, session?.user?.id]);

    const fetchPalettes = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ sort: 'recent', limit: '50' });
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

    const handleLike = async (id: string): Promise<void> => {
        if (!id) return;

        if (!session?.user) {
            toast.error('Sign in to like palettes');
            return;
        }

        try {
            const res = await fetch(`/api/palettes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle' }),
            });

            if (res.status === 401) {
                toast.error('Sign in to like palettes');
                return;
            }

            if (!res.ok) throw new Error('Failed to like');

            const data = await res.json();

            setPalettes((prev) =>
                prev.map((p) => (p._id === id ? { ...p, likes: data.likes } : p))
            );

            setLikedIds((prev) => {
                const next = new Set(prev);
                if (data.liked) {
                    next.add(id);
                } else {
                    next.delete(id);
                }
                return next;
            });
        } catch {
            toast.error('Failed to update like');
        }
    };

    return (
        <div className={`page ${styles.page}`}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>My Palettes</h1>
                    <p className={styles.subtitle}>Your saved color palettes</p>
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
                                        onLike={handleLike}
                                        isLiked={palette._id ? likedIds.has(palette._id) : false}
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

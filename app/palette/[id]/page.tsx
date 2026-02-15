'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ColorSwatch from '@/components/ColorSwatch';
import ExportModal from '@/components/ExportModal';
import { getContrastRatio } from '@/lib/palette-utils';
import type { Palette } from '@/types';
import styles from './page.module.css';

interface PaletteDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function PaletteDetailPage({ params }: PaletteDetailPageProps): React.JSX.Element {
    const { id } = use(params);
    const [palette, setPalette] = useState<Palette | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showExport, setShowExport] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPalette();
    }, [id]);

    const fetchPalette = async (): Promise<void> => {
        try {
            const res = await fetch(`/api/palettes/${id}`);
            if (!res.ok) throw new Error('Not found');
            const data: Palette = await res.json();
            setPalette(data);
        } catch {
            setError('Palette not found');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (!confirm('Delete this palette?')) return;
        try {
            await fetch(`/api/palettes/${id}`, { method: 'DELETE' });
            toast.success('Palette deleted');
            window.location.href = '/gallery';
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (isLoading) {
        return (
            <div className={`page ${styles.page}`}>
                <div className="container">
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                        <p>Loading palette...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !palette) {
        return (
            <div className={`page ${styles.page}`}>
                <div className="container">
                    <div className={styles.error}>
                        <h2>Palette not found</h2>
                        <Link href="/gallery" className="btn btn-secondary">
                            <ArrowLeft size={16} /> Back to Saved Palettes
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`page ${styles.page}`}>
            <div className="container">
                <Link href="/gallery" className={styles.backLink}>
                    <ArrowLeft size={16} /> Back to Saved Palettes
                </Link>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{palette.name}</h1>
                        {palette.mood && (
                            <span className="badge badge-accent">{palette.mood}</span>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <button className="btn btn-secondary" onClick={() => setShowExport(true)}>
                            <Download size={16} /> Export
                        </button>
                        <button className="btn btn-ghost" onClick={handleDelete}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className={styles.swatches}>
                    {palette.colors.map((color, i) => (
                        <ColorSwatch key={i} hex={color.hex} name={color.name} size="large" />
                    ))}
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Contrast Grid</h2>
                    <div className={styles.contrastGrid}>
                        <div className={styles.contrastHeader}>
                            <div className={styles.contrastCorner}></div>
                            {palette.colors.map((c, i) => (
                                <div key={i} className={styles.contrastLabel} style={{ backgroundColor: c.hex }}>
                                    <span style={{ color: c.hex === '#ffffff' || c.hex === '#fff' ? '#000' : '#fff', fontSize: '0.65rem' }}>
                                        {i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {palette.colors.map((c1, i) => (
                            <div key={i} className={styles.contrastRow}>
                                <div className={styles.contrastLabel} style={{ backgroundColor: c1.hex }}>
                                    <span style={{ color: c1.hex === '#ffffff' || c1.hex === '#fff' ? '#000' : '#fff', fontSize: '0.65rem' }}>
                                        {i + 1}
                                    </span>
                                </div>
                                {palette.colors.map((c2, j) => {
                                    const ratio = getContrastRatio(c1.hex, c2.hex);
                                    const pass = ratio >= 4.5;
                                    return (
                                        <div
                                            key={j}
                                            className={`${styles.contrastCell} ${pass ? styles.pass : styles.fail}`}
                                            title={`${c1.hex} vs ${c2.hex}`}
                                        >
                                            {ratio.toFixed(1)}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className={styles.contrastLegend}>
                        <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.pass}`}></span> ≥ 4.5 (WCAG AA)</span>
                        <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.fail}`}></span> &lt; 4.5</span>
                    </div>
                </div>
            </div>

            {showExport && (
                <ExportModal
                    palette={palette}
                    onClose={() => setShowExport(false)}
                />
            )}
        </div>
    );
}

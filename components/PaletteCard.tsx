'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { PaletteCardProps } from '@/types';
import styles from './PaletteCard.module.css';

export default function PaletteCard({ palette, onLike, isLiked = false }: PaletteCardProps): React.JSX.Element {
    const { _id, name, colors, mood, likes = 0 } = palette;

    return (
        <div className={styles.card}>
            <Link href={_id ? `/palette/${_id}` : '#'} className={styles.link}>
                <div className={styles.colors}>
                    {colors.map((color, i) => (
                        <div
                            key={i}
                            className={styles.stripe}
                            style={{ backgroundColor: color.hex }}
                        />
                    ))}
                </div>
            </Link>
            <div className={styles.footer}>
                <div className={styles.meta}>
                    <h3 className={styles.name}>{name}</h3>
                    {mood && <span className={styles.mood}>{mood}</span>}
                </div>
                <button
                    className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        if (_id) onLike?.(_id);
                    }}
                    aria-label={isLiked ? 'Unlike palette' : 'Like palette'}
                >
                    <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likes}</span>
                </button>
            </div>
            <div className={styles.hexRow}>
                {colors.map((color, i) => (
                    <span key={i} className={styles.hexCode}>{color.hex}</span>
                ))}
            </div>
        </div>
    );
}

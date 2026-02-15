'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Palette } from 'lucide-react';
import { generatePaletteFromMood } from '@/lib/palette-utils';
import type { Color } from '@/types';
import styles from './page.module.css';

export default function HomePage(): React.JSX.Element {
    const moods = ['vibrant', 'ocean', 'sunset', 'tropical', 'neon', 'romantic', 'forest', 'midnight'];
    const [moodIndex, setMoodIndex] = useState(0);
    const [heroColors, setHeroColors] = useState<Color[]>(() => generatePaletteFromMood(moods[0]));

    const nextPalette = (): void => {
        const next = (moodIndex + 1) % moods.length;
        setMoodIndex(next);
        setHeroColors(generatePaletteFromMood(moods[next]));
    };

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroBg}>
                    {heroColors.map((color, i) => (
                        <div
                            key={`${moodIndex}-${i}`}
                            className={styles.heroOrb}
                            style={{
                                background: color.hex,
                                left: `${10 + i * 20}%`,
                                top: `${25 + (i % 3) * 18}%`,
                                animationDelay: `${i * 0.8}s`,
                            }}
                        />
                    ))}
                </div>

                <div className={`container ${styles.heroContent}`}>
                    <h1 className={styles.heroTitle}>
                        Color palettes,
                        <br />
                        <span className="gradient-text">made simple.</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Describe a mood. Get a palette. Save it.
                    </p>

                    {/* Live Palette Preview */}
                    <div className={styles.heroDemo}>
                        <div className={styles.heroPalette}>
                            {heroColors.map((color, i) => (
                                <div
                                    key={`${moodIndex}-${i}`}
                                    className={styles.heroSwatch}
                                    style={{ backgroundColor: color.hex, animationDelay: `${i * 0.08}s` }}
                                >
                                    <span className={styles.heroHex}>{color.hex}</span>
                                </div>
                            ))}
                        </div>
                        <button className={styles.shuffleBtn} onClick={nextPalette}>
                            <Sparkles size={14} />
                            Shuffle
                        </button>
                    </div>

                    <div className={styles.heroActions}>
                        <Link href="/generate" className="btn btn-primary">
                            Start Creating
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className="container">
                    <div className={styles.footerContent}>
                        <div className={styles.footerBrand}>
                            <Palette size={18} />
                            <span>PaletteAI</span>
                        </div>
                        <p className={styles.footerText}>
                            Built with Next.js &amp; Azure AI
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

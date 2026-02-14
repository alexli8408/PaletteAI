'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Image as ImageIcon, Download, Wand2, ArrowRight, Zap, Palette, Eye } from 'lucide-react';
import { generatePaletteFromMood } from '@/lib/palette-utils';
import PaletteCard from '@/components/PaletteCard';
import type { Color, Palette as PaletteType } from '@/types';
import styles from './page.module.css';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function HomePage(): React.JSX.Element {
    const [demoPalettes, setDemoPalettes] = useState<PaletteType[]>([]);
    const [heroColors, setHeroColors] = useState<Color[]>([]);

    useEffect(() => {
        const moods = ['sunset', 'ocean', 'forest', 'candy', 'midnight', 'autumn'];
        const names = ['Sunset Glow', 'Ocean Breeze', 'Forest Mist', 'Candy Dream', 'Midnight Sky', 'Autumn Leaves'];
        const palettes: PaletteType[] = moods.map((mood, i) => ({
            name: names[i],
            colors: generatePaletteFromMood(mood),
            mood,
            source: 'ai' as const,
            likes: 0,
            tags: [],
        }));
        setDemoPalettes(palettes);
        setHeroColors(generatePaletteFromMood('vibrant'));
    }, []);

    const heroMoods = ['vibrant', 'ocean', 'sunset', 'tropical', 'neon', 'romantic'];
    const [heroMoodIndex, setHeroMoodIndex] = useState(0);

    const regenerateHero = (): void => {
        const nextIndex = (heroMoodIndex + 1) % heroMoods.length;
        setHeroMoodIndex(nextIndex);
        setHeroColors(generatePaletteFromMood(heroMoods[nextIndex]));
    };

    const features: Feature[] = [
        {
            icon: <Wand2 size={24} />,
            title: 'AI-Powered Generation',
            description: 'Describe a mood or keyword and get a perfectly harmonized palette powered by Azure OpenAI.',
        },
        {
            icon: <ImageIcon size={24} />,
            title: 'Extract from Images',
            description: 'Upload any image and extract its dominant colors using Azure Computer Vision.',
        },
        {
            icon: <Download size={24} />,
            title: 'Export Anywhere',
            description: 'Export palettes as CSS variables, JSON, or SVG. Copy hex codes with one click.',
        },
        {
            icon: <Eye size={24} />,
            title: 'Accessibility Check',
            description: 'See contrast ratios and ensure your palette is accessible for all users.',
        },
    ];

    return (
        <div className={styles.page}>
            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroBg}>
                    {heroColors.map((color, i) => (
                        <div
                            key={i}
                            className={styles.heroOrb}
                            style={{
                                background: color.hex,
                                left: `${15 + i * 18}%`,
                                top: `${20 + (i % 3) * 20}%`,
                                animationDelay: `${i * 0.5}s`,
                            }}
                        />
                    ))}
                </div>

                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadge}>
                        <Zap size={14} />
                        <span>Powered by Azure AI</span>
                    </div>

                    <h1 className={styles.heroTitle}>
                        Create stunning palettes
                        <br />
                        <span className="gradient-text">with AI magic</span>
                    </h1>

                    <p className={styles.heroSubtitle}>
                        Describe a mood, upload an image, or let AI generate the perfect color palette.
                        Export to CSS, JSON, or SVG in one click.
                    </p>

                    <div className={styles.heroActions}>
                        <Link href="/generate" className="btn btn-primary">
                            <Sparkles size={18} />
                            Start Generating
                            <ArrowRight size={16} />
                        </Link>
                        <Link href="/gallery" className="btn btn-secondary">
                            <Palette size={18} />
                            Browse Gallery
                        </Link>
                    </div>

                    {/* Live Demo Palette */}
                    {heroColors.length > 0 && (
                        <div className={styles.heroDemo}>
                            <div className={styles.heroPalette}>
                                {heroColors.map((color, i) => (
                                    <div
                                        key={i}
                                        className={styles.heroSwatch}
                                        style={{ backgroundColor: color.hex, animationDelay: `${i * 0.1}s` }}
                                    >
                                        <span className={styles.heroHex}>{color.hex}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-ghost" onClick={regenerateHero}>
                                <Sparkles size={14} />
                                Regenerate
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className={styles.features}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>
                        Everything you need for
                        <span className="gradient-text"> perfect palettes</span>
                    </h2>
                    <div className={styles.featureGrid}>
                        {features.map((feature, i) => (
                            <div key={i} className={`glass ${styles.featureCard}`} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Palettes */}
            <section className={styles.trending}>
                <div className="container">
                    <div className={styles.trendingHeader}>
                        <h2 className={styles.sectionTitle}>
                            <Sparkles size={24} className={styles.trendingIcon} />
                            Trending Palettes
                        </h2>
                        <Link href="/gallery" className="btn btn-ghost">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className={styles.trendingGrid}>
                        {demoPalettes.map((palette, i) => (
                            <PaletteCard key={i} palette={palette} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className={styles.cta}>
                <div className="container">
                    <div className={styles.ctaCard}>
                        <h2 className={styles.ctaTitle}>Ready to create something beautiful?</h2>
                        <p className={styles.ctaSubtitle}>Generate your first palette in seconds — no sign up required.</p>
                        <Link href="/generate" className="btn btn-primary">
                            <Sparkles size={18} />
                            Get Started Free
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
                            <Palette size={20} />
                            <span>PaletteAI</span>
                        </div>
                        <p className={styles.footerText}>
                            Built with Next.js, MongoDB & Azure
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

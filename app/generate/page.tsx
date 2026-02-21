'use client';

import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import ColorSwatch from '@/components/ColorSwatch';
import ImageDropzone from '@/components/ImageDropzone';
import ExportModal from '@/components/ExportModal';

import type { Color } from '@/types';
import styles from './page.module.css';

interface GeneratedPalette {
    name: string;
    colors: Color[];
    mood?: string;
    source: string;
}

type TabId = 'mood' | 'image';

export default function GeneratePage(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<TabId>('mood');
    const [mood, setMood] = useState<string>('');
    const [palette, setPalette] = useState<GeneratedPalette | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showExport, setShowExport] = useState<boolean>(false);
    const [paletteName, setPaletteName] = useState<string>('');

    // Mood / Keyword generation
    const handleGenerate = async (): Promise<void> => {
        if (!mood.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/palettes/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: mood.trim() }),
            });

            if (!res.ok) throw new Error('Failed to generate');

            const data: GeneratedPalette = await res.json();
            setPalette(data);
            setPaletteName(data.name || `${mood.trim()} Palette`);
            toast.success('Palette generated!');

        } catch (error) {
            toast.error('Failed to generate palette');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Image extraction
    const handleImageUpload = async (file: File): Promise<void> => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('/api/palettes/extract', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to extract');

            const data: GeneratedPalette = await res.json();
            setPalette(data);
            setPaletteName(data.name || 'Extracted Palette');
            toast.success('Palette generated!');
        } catch (error) {
            toast.error('Failed to extract colors');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };



    // Save to gallery
    const handleSave = async (): Promise<void> => {
        if (!palette || !paletteName.trim()) {
            toast.error('Give your palette a name first');
            return;
        }

        try {
            const res = await fetch('/api/palettes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: paletteName.trim(),
                    colors: palette.colors,
                    mood: palette.mood || mood,
                    source: palette.source || 'manual',
                    tags: palette.mood ? [palette.mood.toLowerCase()] : [],
                }),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Palette saved!');
        } catch (error) {
            toast.error('Failed to save palette (is MongoDB running?)');
            console.error(error);
        }
    };

    const moodSuggestions: string[] = [
        'Sunset', 'Ocean', 'Forest', 'Candy', 'Midnight',
        'Neon', 'Retro', 'Pastel', 'Autumn', 'Tropical',
        'Luxury', 'Minimal', 'Romantic', 'Winter', 'Vibrant',
        'Cosmic',
    ];

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'mood', label: 'Enter Keyword', icon: <Sparkles size={15} /> },
        { id: 'image', label: 'Upload Image', icon: <ImageIcon size={15} /> },
    ];

    return (
        <div className={`page ${styles.page}`}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <Sparkles size={28} className={styles.titleIcon} />
                        PaletteAI
                    </h1>
                    <p className={styles.subtitle}>
                        Enter a keyword or upload an image to generate a palette.
                    </p>
                </div>

                {/* Tabs */}
                <div className={styles.tabBar}>
                    <div className="tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className={styles.inputArea}>
                    {activeTab === 'mood' && (
                        <div className={styles.moodInput}>
                            <div className={styles.inputRow}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter a keyword..."
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                    disabled={isLoading}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleGenerate}
                                    disabled={isLoading || !mood.trim()}
                                >
                                    <Sparkles size={18} />
                                    Generate
                                </button>
                            </div>
                            <div className={styles.suggestions}>
                                <span className={styles.suggestLabel}>Try:</span>
                                {moodSuggestions.map((s) => (
                                    <button
                                        key={s}
                                        className={styles.suggestion}
                                        onClick={() => {
                                            setMood(s);
                                            setIsLoading(true);
                                            fetch('/api/palettes/generate', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ mood: s }),
                                            })
                                                .then((r) => r.json())
                                                .then((data: GeneratedPalette) => {
                                                    setPalette(data);
                                                    setPaletteName(data.name || `${s} Palette`);
                                                    toast.success('Palette generated!');

                                                })
                                                .catch(() => toast.error('Failed'))
                                                .finally(() => setIsLoading(false));
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'image' && (
                        <ImageDropzone onImageUpload={handleImageUpload} isLoading={isLoading} />
                    )}


                </div>

                {/* Result */}
                {palette && (
                    <div className={styles.result}>
                        <div className={styles.nameRow}>
                            <input
                                type="text"
                                className={`input ${styles.nameInput}`}
                                placeholder="Name your palette..."
                                value={paletteName}
                                onChange={(e) => setPaletteName(e.target.value)}
                            />
                            <div className={styles.resultActions}>

                                <button className="btn btn-secondary" onClick={() => setShowExport(true)}>
                                    <Download size={16} />
                                    Export
                                </button>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    <Save size={16} />
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className={`${styles.swatches} stagger`}>
                            {palette.colors.map((color, i) => (
                                <div key={i} className={styles.swatchWrapper}>
                                    <ColorSwatch hex={color.hex} name={color.name} size="large" />
                                </div>
                            ))}
                        </div>


                    </div>
                )}





            </div>

            {/* Export Modal */}
            {showExport && palette && (
                <ExportModal
                    palette={{ colors: palette.colors, name: paletteName }}
                    onClose={() => setShowExport(false)}
                />
            )}
        </div>
    );
}

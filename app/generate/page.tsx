'use client';

import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Sliders, RefreshCw, Save, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ColorSwatch from '@/components/ColorSwatch';
import ImageDropzone from '@/components/ImageDropzone';
import ExportModal from '@/components/ExportModal';
import { generateRandomPalette, getColorName } from '@/lib/palette-utils';
import type { Color } from '@/types';
import styles from './page.module.css';

interface GeneratedPalette {
    name: string;
    colors: Color[];
    mood?: string;
    source: string;
}

type TabId = 'mood' | 'image' | 'manual';

export default function GeneratePage(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<TabId>('mood');
    const [mood, setMood] = useState<string>('');
    const [palette, setPalette] = useState<GeneratedPalette | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showExport, setShowExport] = useState<boolean>(false);
    const [paletteName, setPaletteName] = useState<string>('');

    // Mood / Keyword generation
    const handleGenerate = async (): Promise<void> => {
        if (!mood.trim()) {
            toast.error('Enter a mood or keyword');
            return;
        }

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
            toast.success('Colors extracted!');
        } catch (error) {
            toast.error('Failed to extract colors');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Manual color edit
    const handleColorChange = (index: number, hex: string): void => {
        if (!palette) return;
        const newColors = [...palette.colors];
        newColors[index] = { hex, name: getColorName(hex) };
        setPalette({ ...palette, colors: newColors, source: 'manual' });
    };

    // Random palette
    const handleRandom = (): void => {
        const colors = generateRandomPalette();
        setPalette({
            name: 'Random Palette',
            colors,
            mood: 'random',
            source: 'manual',
        });
        setPaletteName('Random Palette');
        toast.success('Random palette generated!');
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

            toast.success('Palette saved to gallery!');
        } catch (error) {
            toast.error('Failed to save palette (is MongoDB running?)');
            console.error(error);
        }
    };

    const moodSuggestions: string[] = [
        'sunset', 'ocean', 'forest', 'candy', 'midnight',
        'neon', 'retro', 'pastel', 'autumn', 'tropical',
        'luxury', 'minimal', 'romantic', 'winter', 'vibrant',
    ];

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'mood', label: 'Enter Keyword', icon: <Sparkles size={15} /> },
        { id: 'image', label: 'Upload Image', icon: <ImageIcon size={15} /> },
        { id: 'manual', label: 'Create Manually', icon: <Sliders size={15} /> },
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
                        Enter a keyword, upload an image, or create manually
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
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 size={18} className={styles.spin} /> : <Sparkles size={18} />}
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

                    {activeTab === 'manual' && (
                        <div className={styles.manualInput}>
                            <p className={styles.manualHint}>Click the color swatches below to edit, or start with a random palette:</p>
                            <button className="btn btn-secondary" onClick={handleRandom}>
                                <RefreshCw size={16} />
                                Generate Random
                            </button>
                        </div>
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
                                <button className="btn btn-secondary btn-icon" onClick={handleRandom} title="Regenerate">
                                    <RefreshCw size={16} />
                                </button>
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
                                    {activeTab === 'manual' && (
                                        <input
                                            type="color"
                                            className={styles.colorPicker}
                                            value={color.hex}
                                            onChange={(e) => handleColorChange(i, e.target.value)}
                                        />
                                    )}
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

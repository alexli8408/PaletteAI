'use client';

import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Sliders, RefreshCw, Save, Download, Heart, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ColorSwatch from '@/components/ColorSwatch';
import ImageDropzone from '@/components/ImageDropzone';
import ExportModal from '@/components/ExportModal';
import { generateRandomPalette, getColorName } from '@/lib/palette-utils';
import styles from './page.module.css';

export default function GeneratePage() {
    const [activeTab, setActiveTab] = useState('mood');
    const [mood, setMood] = useState('');
    const [palette, setPalette] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [paletteName, setPaletteName] = useState('');

    // Mood / Keyword generation
    const handleGenerate = async () => {
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

            const data = await res.json();
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
    const handleImageUpload = async (file) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('/api/palettes/extract', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to extract');

            const data = await res.json();
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
    const handleColorChange = (index, hex) => {
        if (!palette) return;
        const newColors = [...palette.colors];
        newColors[index] = { hex, name: getColorName(hex) };
        setPalette({ ...palette, colors: newColors, source: 'manual' });
    };

    // Random palette
    const handleRandom = () => {
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
    const handleSave = async () => {
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

    const moodSuggestions = [
        'sunset', 'ocean', 'forest', 'candy', 'midnight',
        'neon', 'retro', 'pastel', 'autumn', 'tropical',
        'luxury', 'minimal', 'romantic', 'winter', 'vibrant',
    ];

    return (
        <div className={`page ${styles.page}`}>
            <div className="container">
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        <Sparkles size={28} className={styles.titleIcon} />
                        Palette Generator
                    </h1>
                    <p className={styles.subtitle}>
                        Describe a mood, upload an image, or create manually
                    </p>
                </div>

                {/* Tabs */}
                <div className={styles.tabBar}>
                    <div className="tabs">
                        {[
                            { id: 'mood', label: 'Mood / Keyword', icon: <Sparkles size={15} /> },
                            { id: 'image', label: 'Upload Image', icon: <ImageIcon size={15} /> },
                            { id: 'manual', label: 'Manual', icon: <Sliders size={15} /> },
                        ].map((tab) => (
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
                                    placeholder="Enter a mood, feeling, or keyword... (e.g. sunset, ocean, cozy)"
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
                                            // Auto-generate
                                            setIsLoading(true);
                                            fetch('/api/palettes/generate', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ mood: s }),
                                            })
                                                .then((r) => r.json())
                                                .then((data) => {
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
                        {/* Palette name input */}
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

                        {/* Color Swatches */}
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

                {/* Empty State */}
                {!palette && !isLoading && (
                    <div className={styles.empty}>
                        <Sparkles size={48} className={styles.emptyIcon} />
                        <h3>Your palette will appear here</h3>
                        <p>Enter a mood above or click a suggestion to get started</p>
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

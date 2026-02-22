'use client';

import { useState } from 'react';
import { X, FileCode, FileJson, FileImage, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportAsCSS, exportAsJSON, exportAsSVG } from '@/lib/palette-utils';
import type { ExportModalProps, ExportFormat } from '@/types';
import styles from './ExportModal.module.css';

export default function ExportModal({ palette, onClose }: ExportModalProps): React.JSX.Element | null {
    const [activeTab, setActiveTab] = useState<ExportFormat>('css');
    const [copied, setCopied] = useState<boolean>(false);

    if (!palette) return null;

    const exports: Record<ExportFormat, string> = {
        css: exportAsCSS(palette.colors, palette.name?.toLowerCase().replace(/\s+/g, '-') || 'palette'),
        json: exportAsJSON(palette.colors, palette.name || 'Palette'),
        svg: exportAsSVG(palette.colors),
    };

    const handleCopy = (): void => {
        navigator.clipboard.writeText(exports[activeTab]);
        setCopied(true);
        toast.success(`Copied ${activeTab.toUpperCase()} to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (): void => {
        const extensions: Record<ExportFormat, string> = { css: 'css', json: 'json', svg: 'svg' };
        const mimeTypes: Record<ExportFormat, string> = { css: 'text/css', json: 'application/json', svg: 'image/svg+xml' };

        const blob = new Blob([exports[activeTab]], { type: mimeTypes[activeTab] });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette.${extensions[activeTab]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded palette.${extensions[activeTab]}!`);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Export Palette</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'css' ? 'active' : ''}`}
                        onClick={() => setActiveTab('css')}
                    >
                        <FileCode size={14} />
                        CSS
                    </button>
                    <button
                        className={`tab ${activeTab === 'json' ? 'active' : ''}`}
                        onClick={() => setActiveTab('json')}
                    >
                        <FileJson size={14} />
                        JSON
                    </button>
                    <button
                        className={`tab ${activeTab === 'svg' ? 'active' : ''}`}
                        onClick={() => setActiveTab('svg')}
                    >
                        <FileImage size={14} />
                        SVG
                    </button>
                </div>

                <div className={styles.codeBlock}>
                    <pre className={styles.code}>{exports[activeTab]}</pre>
                </div>

                <div className={styles.actions}>
                    <button className="btn btn-secondary" onClick={handleCopy}>
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="btn btn-primary" onClick={handleDownload}>
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
}

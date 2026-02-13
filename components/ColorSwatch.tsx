'use client';

import { useState, type MouseEvent } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTextColor, hexToRgb, hexToHsl } from '@/lib/palette-utils';
import type { ColorSwatchProps } from '@/types';
import styles from './ColorSwatch.module.css';

interface ExtendedColorSwatchProps extends ColorSwatchProps {
    showInfo?: boolean;
    onClick?: () => void;
}

export default function ColorSwatch({ hex, name, size = 'medium', showInfo = true, onClick }: ExtendedColorSwatchProps): React.JSX.Element {
    const [copied, setCopied] = useState<boolean>(false);

    const textColor = getTextColor(hex);
    const rgb = hexToRgb(hex);
    const hsl = hexToHsl(hex);

    const handleCopy = (e: MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        navigator.clipboard.writeText(hex);
        setCopied(true);
        toast.success(`Copied ${hex}`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={`${styles.swatch} ${styles[size]}`}
            style={{ backgroundColor: hex }}
            onClick={onClick || (() => { navigator.clipboard.writeText(hex); toast.success(`Copied ${hex}`); })}
        >
            {showInfo && (
                <div className={styles.info} style={{ color: textColor }}>
                    <span className={styles.hex}>{hex.toUpperCase()}</span>
                    <span className={styles.name}>{name}</span>
                    {size === 'large' && rgb && hsl && (
                        <div className={styles.details}>
                            <span>RGB({rgb.r}, {rgb.g}, {rgb.b})</span>
                            <span>HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)</span>
                        </div>
                    )}
                    <button
                        className={styles.copyBtn}
                        onClick={handleCopy}
                        style={{ color: textColor, borderColor: `${textColor}33` }}
                        aria-label="Copy hex code"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            )}
        </div>
    );
}

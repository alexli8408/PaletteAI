'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import styles from './ImageDropzone.module.css';

export default function ImageDropzone({ onImageUpload, isLoading }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onImageUpload(acceptedFiles[0]);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: isLoading,
    });

    return (
        <div
            {...getRootProps()}
            className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${isLoading ? styles.loading : ''}`}
        >
            <input {...getInputProps()} />
            <div className={styles.content}>
                {isLoading ? (
                    <>
                        <div className={styles.spinner} />
                        <p className={styles.title}>Extracting colors...</p>
                    </>
                ) : isDragActive ? (
                    <>
                        <ImageIcon size={40} className={styles.icon} />
                        <p className={styles.title}>Drop your image here</p>
                    </>
                ) : (
                    <>
                        <Upload size={40} className={styles.icon} />
                        <p className={styles.title}>Drop an image here, or click to browse</p>
                        <p className={styles.subtitle}>PNG, JPG, WEBP up to 10MB</p>
                    </>
                )}
            </div>
        </div>
    );
}

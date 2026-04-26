'use client';

/* ─── Upload / Landing Page ─── */

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ImageIcon,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Crop,
  Palette,
  ArrowRight,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const FEATURES = [
  { icon: Crop, label: 'Crop & Rotate', desc: 'Precise framing with aspect ratios' },
  { icon: Palette, label: 'Filters', desc: '15 cinematic & artistic presets' },
  { icon: SlidersHorizontal, label: 'Adjustments', desc: 'Brightness, contrast, temperature & more' },
  { icon: Layers, label: 'Layers', desc: 'Multi-layer compositing with blend modes' },
  { icon: Sparkles, label: 'Resize & Export', desc: 'Compress, resize, convert formats' },
];

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/bmp', 'image/gif'];

export default function HomePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error('Unsupported format. Try PNG, JPEG, WebP, or AVIF.');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File is too large. Max 100 MB.');
        return;
      }

      setIsLoading(true);

      // Store in sessionStorage as data URL for editor page
      const reader = new FileReader();
      reader.onload = () => {
        try {
          sessionStorage.setItem('imagepal-file-data', reader.result as string);
          sessionStorage.setItem('imagepal-file-name', file.name);
          sessionStorage.setItem('imagepal-file-type', file.type);
          sessionStorage.setItem('imagepal-file-size', file.size.toString());
          router.push('/editor');
        } catch {
          toast.error('Image is too large for browser storage. Try a smaller file.');
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read file.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--surface-3)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
          },
        }}
      />

      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'var(--surface-0)' }}>

        {/* Ambient glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent-subtle) 0%, transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-10"
        >
          {/* Logo / Title */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent), #d4943a)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <ImageIcon size={28} style={{ color: 'var(--surface-0)' }} />
            </motion.div>

            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              ImagePal
            </h1>
            <p
              className="text-center max-w-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)', fontSize: '15px' }}
            >
              Everything runs locally in your browser.
              <br />
              No uploads. No server. Full control.
            </p>
          </div>

          {/* Drop zone */}
          <motion.div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full cursor-pointer relative overflow-hidden"
            style={{
              borderRadius: 'var(--radius-xl)',
              border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border-hover)'}`,
              background: isDragging ? 'var(--accent-subtle)' : 'var(--glass-bg)',
              transition: 'all var(--duration-normal) var(--ease-out)',
              padding: '48px 24px',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              id="file-upload"
            />

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-full animate-spin"
                    style={{
                      border: '3px solid var(--surface-4)',
                      borderTopColor: 'var(--accent)',
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Preparing editor...
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Upload size={24} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="text-base font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Drop your image here
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                      or click to browse · PNG, JPEG, WebP, AVIF
                    </span>
                  </div>

                  {/* CTA button */}
                  <div
                    className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--text-inverse)',
                    }}
                  >
                    Choose File
                    <ArrowRight size={14} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                }}
              >
                <feat.icon size={14} style={{ color: 'var(--accent)' }} />
                {feat.label}
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <p
            className="text-center"
            style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}
          >
            100% offline · Up to 100 MB · Your images never leave your device
          </p>
        </motion.div>
      </div>
    </>
  );
}

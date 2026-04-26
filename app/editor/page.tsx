'use client';

/* ─── Editor Page ─── */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { EditorProvider, useEditor } from '@/lib/editor-context';
import { loadImageFromFile, generateId } from '@/lib/utils';
import { EditorShell } from '@/components/editor/EditorShell';

function EditorLoader() {
  const { dispatch } = useEditor();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const dataUrl = sessionStorage.getItem('imagepal-file-data');
    const fileName = sessionStorage.getItem('imagepal-file-name') || 'untitled';
    const fileType = sessionStorage.getItem('imagepal-file-type') || 'image/png';
    const fileSize = parseInt(sessionStorage.getItem('imagepal-file-size') || '0', 10);

    if (!dataUrl) {
      router.push('/');
      return;
    }

    // Load from data URL
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      dispatch({
        type: 'SET_IMAGE',
        payload: {
          id: generateId(),
          name: fileName,
          type: fileType,
          width: canvas.width,
          height: canvas.height,
          size: fileSize,
          data: imageData,
          originalData: imageData,
        },
      });

      setReady(true);
    };
    img.src = dataUrl;
  }, [dispatch, router]);

  if (!ready) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center"
        style={{ background: 'var(--surface-0)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: '3px solid var(--surface-4)',
              borderTopColor: 'var(--accent)',
            }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Loading image...
          </span>
        </div>
      </div>
    );
  }

  return <EditorShell />;
}

export default function EditorPage() {
  return (
    <EditorProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--surface-3)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          },
        }}
      />
      <EditorLoader />
    </EditorProvider>
  );
}

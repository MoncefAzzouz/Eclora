'use client';

import React, { useRef, useState } from 'react';
import { ImageUp, Link2, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { Button, Field, Input } from './index';
import { useToast } from './Toast';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif';
const MAX_BYTES = 5 * 1024 * 1024;

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  /** Preview box aspect ratio, e.g. "16/9". */
  aspect?: string;
}

/**
 * Picks an image from the admin's computer and uploads it, returning the stored
 * URL. A pasted URL is still accepted for images hosted elsewhere.
 */
export default function ImagePicker({ label, value, onChange, hint, aspect = '16/9' }: ImagePickerProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const send = async (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error('Fichier trop volumineux (5 Mo maximum).');
      return;
    }
    setUploading(true);
    try {
      const { url } = await api.uploads.image(file);
      onChange(url);
      toast.success('Image importée');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Envoi impossible');
    } finally {
      setUploading(false);
      // Let the same file be chosen again after a failure.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void send(file);
  };

  return (
    <Field label={label} hint={hint}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void send(file);
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{ aspectRatio: aspect }}
        className={`relative w-full overflow-hidden rounded-xl border-2 border-dashed transition ${
          dragging ? 'border-black bg-slate-50' : 'border-slate-200 bg-slate-100'
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Aperçu" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Retirer l&rsquo;image"
              className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-slate-600 shadow-sm transition hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400 transition hover:text-slate-600"
          >
            <ImageUp className="h-7 w-7" />
            <span className="text-xs font-bold">Choisir une image</span>
            <span className="text-[11px]">ou glissez-déposez ici</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-xs font-bold text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={ImageUp}
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? 'Remplacer' : 'Importer depuis mon ordinateur'}
        </Button>
        <Button type="button" size="sm" variant="ghost" icon={Link2} onClick={() => setShowUrl((v) => !v)}>
          URL
        </Button>
      </div>

      {showUrl && (
        <Input className="mt-2" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." />
      )}

      <p className="mt-1.5 text-[11px] text-slate-400">JPG, PNG, WEBP, AVIF ou GIF &mdash; 5 Mo maximum.</p>
    </Field>
  );
}

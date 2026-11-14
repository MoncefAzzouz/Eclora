'use client';

import { useRef, useState } from 'react';
import { ImageUp, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import type { Shade } from '@/types/admin';
import { api } from '@/lib/admin/api';
import { Button, Field, IconButton, Input } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

export default function ReferenceEditor({ reference, index, onChange, onAddImage, onRemove, onUploading }: {
  reference: Shade;
  index: number;
  onChange: (patch: Partial<Shade>) => void;
  onAddImage: (url: string) => void;
  onRemove: () => void;
  onUploading: (delta: number) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const images = reference.images ?? [];

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    onUploading(1);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) throw new Error('Fichier trop volumineux (5 Mo maximum).');
        const result = await api.uploads.image(file);
        onAddImage(result.url);
      }
      toast.success('Images de la référence importées');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Envoi impossible');
    } finally {
      setUploading(false);
      onUploading(-1);
      if (input.current) input.current.value = '';
    }
  };
  const move = (i: number, direction: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + direction]] = [next[i + direction]!, next[i]!];
    onChange({ images: next });
  };

  return (
    <fieldset className="min-w-0 space-y-3 rounded-xl border border-slate-200 p-3 sm:p-4">
      <legend className="px-1 text-xs font-bold">Référence {index + 1}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)_5rem_auto] items-end gap-2">
        <Field label="Référence *"><Input value={reference.name} onChange={(event) => onChange({ name: event.target.value })} placeholder="Ex : REF-001" /></Field>
        <Field label="Stock"><Input type="number" min={0} value={reference.stock} onChange={(event) => onChange({ stock: Math.max(0, Number(event.target.value)) })} /></Field>
        <IconButton type="button" label="Retirer la référence" icon={Trash2} tone="danger" onClick={onRemove} disabled={uploading} />
      </div>
      {images.length > 0 && <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {images.map((image, i) => <li key={`${image}-${i}`} className="overflow-hidden rounded-lg border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={`Image ${i + 1} de ${reference.name || 'la référence'}`} className="aspect-square w-full object-contain" />
          <div className="flex items-center justify-center bg-slate-50">
            <IconButton type="button" label="Avancer l’image" icon={ArrowLeft} disabled={i === 0 || uploading} onClick={() => move(i, -1)} />
            <IconButton type="button" label="Reculer l’image" icon={ArrowRight} disabled={i === images.length - 1 || uploading} onClick={() => move(i, 1)} />
            <IconButton type="button" label="Retirer l’image" icon={Trash2} tone="danger" disabled={uploading} onClick={() => onChange({ images: images.filter((_, j) => i !== j) })} />
          </div>
          {i === 0 && <p className="pb-1 text-center text-[10px] font-bold">Image principale</p>}
        </li>)}
      </ul>}
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" aria-label="Images de la référence" className="hidden" onChange={(event) => void upload(event.target.files)} />
      <Button type="button" variant="secondary" icon={ImageUp} loading={uploading} onClick={() => input.current?.click()} className="w-full">Importer des images</Button>
    </fieldset>
  );
}

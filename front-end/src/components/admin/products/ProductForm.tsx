'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, ImageUp } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { emitDataChanged } from '@/lib/admin/useApi';
import { formatDA, slugify, uid } from '@/lib/admin/format';
import { PRODUCT_STATUS } from '@/lib/admin/constants';
import type { BadgeType, Brand, Category, Product, ProductInput, ProductStatus, Shade } from '@/types/admin';
import { Button, ButtonLink, Card, Field, IconButton, Input, Select, Textarea, Thumb, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

const EMPTY: ProductInput = {
  slug: '',
  name: '',
  brandId: '',
  categoryId: '',
  subcategoryId: undefined,
  sku: '',
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  lowStockThreshold: 10,
  volume: '',
  images: [],
  shades: [],
  badge: '',
  badgeType: 'BLACK',
  tags: [],
  isNew: true,
  isBestSeller: false,
  status: 'DRAFT',
  description: '',
  usageTips: '',
  ingredients: '',
};

type Errors = Partial<Record<'name' | 'brandId' | 'categoryId' | 'sku' | 'price' | 'compareAtPrice' | 'images', string>>;

function validate(v: ProductInput): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = 'Le nom est obligatoire';
  if (!v.brandId) e.brandId = 'Choisissez une marque';
  if (!v.categoryId) e.categoryId = 'Choisissez une catégorie';
  if (!v.sku.trim()) e.sku = 'Le SKU est obligatoire';
  if (!v.price || v.price <= 0) e.price = 'Le prix doit être supérieur à 0';
  if (v.compareAtPrice && v.compareAtPrice <= v.price) e.compareAtPrice = 'Doit être supérieur au prix de vente';
  if (v.status === 'ACTIVE' && v.images.length === 0) e.images = 'Ajoutez au moins une image pour mettre en ligne';
  return e;
}

export default function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product;
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<ProductInput>(() => {
    if (!product) return { ...EMPTY, sku: `ECL-${Math.floor(2000 + Math.random() * 7999)}` };
    const { id: _id, rating: _r, reviewsCount: _c, createdAt: _ca, updatedAt: _ua, ...rest } = product;
    return rest;
  });
  const [errors, setErrors] = useState<Errors>({});
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setValues((v) => ({ ...v, [key]: value }));
  const subcategories = categories.find((c) => c.id === values.categoryId)?.subcategories ?? [];
  const shadesStock = values.shades.reduce((s, sh) => s + sh.stock, 0);

  const addImage = () => {
    const url = imageUrl.trim();
    if (!/^https?:\/\//.test(url)) return toast.error('Saisissez une URL d’image valide (https://...)');
    set('images', [...values.images, url]);
    setImageUrl('');
  };

  /** Uploads a file from the admin's computer and appends it to the gallery. */
  const uploadImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error('Fichier trop volumineux (5 Mo maximum).');
    setUploading(true);
    try {
      const { url } = await api.uploads.image(file);
      set('images', [...values.images, url]);
      toast.success('Image importée');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Envoi impossible');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const imgs = [...values.images];
    [imgs[i], imgs[i + dir]] = [imgs[i + dir]!, imgs[i]!];
    set('images', imgs);
  };

  const updateShade = (id: string, patch: Partial<Shade>) =>
    set('shades', values.shades.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !values.tags.includes(t)) set('tags', [...values.tags, t]);
    setTagInput('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductInput = {
      ...values,
      slug: values.slug || slugify(values.name),
      // With shades, total stock is the sum of shade stock.
      stock: values.shades.length ? shadesStock : values.stock,
      badge: values.badge?.trim() || undefined,
      compareAtPrice: values.compareAtPrice || undefined,
    };
    const errs = validate(payload);
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error('Corrigez les champs en rouge');

    setSaving(true);
    let savedId = product?.id;
    const ok = await toast.run(async () => {
      if (product) await api.products.update(product.id, payload);
      else savedId = (await api.products.create(payload)).id;
    }, product ? 'Produit mis à jour' : 'Produit créé');
    setSaving(false);
    if (ok) {
      emitDataChanged();
      if (!product) router.replace(`/admin/products/${savedId}`);
    }
  };

  const discount = values.compareAtPrice && values.price ? Math.round((1 - values.price / values.compareAtPrice) * 100) : 0;

  return (
    <form onSubmit={onSubmit} className="animate-fade-in" noValidate>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Link href="/admin/products" className="text-xs font-bold text-slate-500 hover:text-black inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Produits
          </Link>
          <h2 className="text-xl font-black">{product ? product.name : 'Nouveau produit'}</h2>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/admin/products" variant="secondary">Annuler</ButtonLink>
          <Button type="submit" loading={saving}>{product ? 'Enregistrer' : 'Créer le produit'}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Informations">
            <div className="space-y-4">
              <Field label="Nom du produit *" error={errors.name}>
                <Input value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="Easy Bake Loose Baking & Setting Powder" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Marque *" error={errors.brandId}>
                  <Select value={values.brandId} onChange={(e) => set('brandId', e.target.value)}>
                    <option value="">Choisir...</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Select>
                </Field>
                <Field label="Contenance" hint="Ex : 100 ml, 20 g">
                  <Input value={values.volume ?? ''} onChange={(e) => set('volume', e.target.value)} />
                </Field>
                <Field label="Catégorie *" error={errors.categoryId}>
                  <Select value={values.categoryId} onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value, subcategoryId: undefined }))}>
                    <option value="">Choisir...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
                <Field label="Sous-catégorie">
                  <Select value={values.subcategoryId ?? ''} onChange={(e) => set('subcategoryId', e.target.value || undefined)} disabled={!subcategories.length}>
                    <option value="">Aucune</option>
                    {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </Field>
              </div>
              <Field label="Description">
                <Textarea value={values.description ?? ''} onChange={(e) => set('description', e.target.value)} rows={5} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Conseils d’utilisation">
                  <Textarea value={values.usageTips ?? ''} onChange={(e) => set('usageTips', e.target.value)} rows={3} />
                </Field>
                <Field label="Ingrédients">
                  <Textarea value={values.ingredients ?? ''} onChange={(e) => set('ingredients', e.target.value)} rows={3} />
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Images" description="La première image est l’image principale en boutique.">
            {errors.images && <p className="text-[11px] text-red-600 font-semibold mb-3">{errors.images}</p>}
            {values.images.length > 0 && (
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {values.images.map((src, i) => (
                  <li key={`${src}-${i}`} className="relative group border border-slate-200 rounded-xl overflow-hidden">
                    {i === 0 && <span className="absolute top-1.5 left-1.5 z-10 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Principale</span>}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full aspect-square object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-white/90 py-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconButton type="button" label="Monter" icon={ArrowUp} disabled={i === 0} onClick={() => moveImage(i, -1)} />
                      <IconButton type="button" label="Descendre" icon={ArrowDown} disabled={i === values.images.length - 1} onClick={() => moveImage(i, 1)} />
                      <IconButton type="button" label="Retirer" icon={Trash2} tone="danger" onClick={() => set('images', values.images.filter((_, j) => j !== i))} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadImage(file);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              icon={ImageUp}
              loading={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full"
            >
              Importer depuis mon ordinateur
            </Button>
            <p className="mt-1.5 mb-3 text-[11px] text-slate-400">JPG, PNG, WEBP, AVIF ou GIF — 5 Mo maximum.</p>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                placeholder="ou collez une URL https://..."
              />
              <Button type="button" variant="secondary" icon={Plus} onClick={addImage}>Ajouter</Button>
            </div>
          </Card>

          <Card
            title="Teintes / variantes"
            description="Laissez vide si le produit n’a pas de teintes. Le stock total devient la somme des teintes."
            actions={
              <Button type="button" size="sm" variant="secondary" icon={Plus}
                onClick={() => set('shades', [...values.shades, { id: uid('sh'), name: '', hex: '#d8b4a0', stock: 0 }])}>
                Teinte
              </Button>
            }
          >
            {values.shades.length === 0 ? (
              <p className="text-xs text-slate-500">Aucune teinte.</p>
            ) : (
              <ul className="space-y-2">
                {values.shades.map((sh) => (
                  <li key={sh.id} className="flex items-center gap-2">
                    <input type="color" value={sh.hex} onChange={(e) => updateShade(sh.id, { hex: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer bg-white p-1" aria-label="Couleur" />
                    <Input value={sh.name} onChange={(e) => updateShade(sh.id, { name: e.target.value })} placeholder="Nom de la teinte" />
                    <Input type="number" min={0} value={sh.stock} onChange={(e) => updateShade(sh.id, { stock: Math.max(0, Number(e.target.value)) })}
                      className="!w-24" aria-label="Stock" />
                    <IconButton type="button" label="Retirer" icon={Trash2} tone="danger" onClick={() => set('shades', values.shades.filter((s) => s.id !== sh.id))} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Statut">
            <div className="space-y-4">
              <Select value={values.status} onChange={(e) => set('status', e.target.value as ProductStatus)}>
                {(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map((s) => <option key={s} value={s}>{PRODUCT_STATUS[s].label}</option>)}
              </Select>
              <Toggle checked={values.isNew} onChange={(v) => set('isNew', v)} label="Nouveauté" description="Affiché dans les nouveautés" />
              <Toggle checked={values.isBestSeller} onChange={(v) => set('isBestSeller', v)} label="Best seller" description="Affiché dans les meilleures ventes" />
            </div>
          </Card>

          <Card title="Prix">
            <div className="space-y-4">
              <Field label="Prix de vente (DA) *" error={errors.price}>
                <Input type="number" min={0} step={100} value={values.price || ''} onChange={(e) => set('price', Number(e.target.value))} placeholder="8500" />
              </Field>
              <Field label="Prix barré (DA)" error={errors.compareAtPrice} hint={discount > 0 ? `Affiché avec une remise de -${discount}%` : 'Prix avant réduction, optionnel'}>
                <Input type="number" min={0} step={100} value={values.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value ? Number(e.target.value) : undefined)} />
              </Field>
              {values.price > 0 && <p className="text-[11px] text-slate-500">Affiché en boutique : <b className="text-black">{formatDA(values.price)}</b></p>}
            </div>
          </Card>

          <Card title="Stock">
            <div className="space-y-4">
              <Field label="SKU *" error={errors.sku}>
                <Input value={values.sku} onChange={(e) => set('sku', e.target.value.toUpperCase())} />
              </Field>
              <Field label="Quantité en stock" hint={values.shades.length ? 'Calculé à partir des teintes' : undefined}>
                <Input type="number" min={0} value={values.shades.length ? shadesStock : values.stock}
                  disabled={values.shades.length > 0} onChange={(e) => set('stock', Math.max(0, Number(e.target.value)))} />
              </Field>
              <Field label="Alerte stock faible" hint="Vous serez alerté sous ce seuil">
                <Input type="number" min={0} value={values.lowStockThreshold} onChange={(e) => set('lowStockThreshold', Math.max(0, Number(e.target.value)))} />
              </Field>
            </div>
          </Card>

          <Card title="Badge & étiquettes">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Badge">
                  <Input value={values.badge ?? ''} onChange={(e) => set('badge', e.target.value)} placeholder="Exclu, -40%..." />
                </Field>
                <Field label="Couleur">
                  <Select value={values.badgeType} onChange={(e) => set('badgeType', e.target.value as BadgeType)}>
                    <option value="BLACK">Noir</option>
                    <option value="PINK">Rose</option>
                    <option value="RED">Rouge</option>
                    <option value="GOLD">Or</option>
                  </Select>
                </Field>
              </div>
              <Field label="Étiquettes" hint="Entrée pour ajouter (ex : vegan, sans parfum)">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              </Field>
              {values.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {values.tags.map((t) => (
                    <button type="button" key={t} onClick={() => set('tags', values.tags.filter((x) => x !== t))}
                      className="text-[11px] font-bold bg-slate-100 hover:bg-red-50 hover:text-red-700 px-2 py-1 rounded-lg">
                      {t} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {values.images[0] && (
            <Card title="Aperçu">
              <div className="flex items-center gap-3">
                <Thumb src={values.images[0]} alt="" size={56} />
                <div className="text-xs min-w-0">
                  <div className="text-[10px] font-black uppercase text-slate-500">{brands.find((b) => b.id === values.brandId)?.name}</div>
                  <div className="font-bold line-clamp-2">{values.name || 'Nom du produit'}</div>
                  <div className="font-black mt-0.5">{values.price ? formatDA(values.price) : '—'}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { ErrorState, LoadingState } from '@/components/admin/ui';
import ProductForm from '@/components/admin/products/ProductForm';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useApi(async () => {
    const [product, categories, brands] = await Promise.all([api.products.get(id), api.categories.list(), api.brands.list()]);
    return { product, categories, brands };
  }, [id]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Produit introuvable'} onRetry={reload} />;
  return <ProductForm key={data.product.id} product={data.product} categories={data.categories} brands={data.brands} />;
}

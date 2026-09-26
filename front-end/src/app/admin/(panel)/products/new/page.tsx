'use client';

import React from 'react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { ErrorState, LoadingState } from '@/components/admin/ui';
import ProductForm from '@/components/admin/products/ProductForm';

export default function NewProductPage() {
  const { data, loading, error, reload } = useApi(async () => {
    const [categories, brands] = await Promise.all([api.categories.list(), api.brands.list()]);
    return { categories, brands };
  });

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;
  return <ProductForm categories={data.categories} brands={data.brands} />;
}

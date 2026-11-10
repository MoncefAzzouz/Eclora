'use client';

// Categories and brands change rarely, and the header, menu and filters all
// need them: fetch once per page load and share the result.
import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import { shopApi, type ApiBrand, type ApiCategory } from './api';

let categoriesPromise: Promise<ApiCategory[]> | null = null;
let brandsPromise: Promise<ApiBrand[]> | null = null;

interface InitialCatalog {
  categories?: ApiCategory[];
  brands?: ApiBrand[];
}
const CatalogContext = createContext<InitialCatalog>({});

export function CatalogProvider({ categories, brands, children }: InitialCatalog & { children: ReactNode }) {
  return createElement(CatalogContext.Provider, { value: { categories, brands } }, children);
}

function cached<T>(get: () => Promise<T> | null, set: (p: Promise<T> | null) => void, load: () => Promise<T>) {
  let p = get();
  if (!p) {
    p = load().catch((e) => {
      set(null); // let the next caller retry
      throw e;
    });
    set(p);
  }
  return p;
}

export const loadCategories = () =>
  cached(() => categoriesPromise, (p) => (categoriesPromise = p), () => shopApi.categories());
export const loadAllBrands = () =>
  cached(() => brandsPromise, (p) => (brandsPromise = p), () => shopApi.brands(true));

function usePromise<T>(load: () => Promise<T>, fallback: T, initial?: T): T {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    if (initial !== undefined) return;
    let alive = true;
    load().then((v) => alive && setValue(v), () => undefined);
    return () => {
      alive = false;
    };
  }, [load, initial]);
  return initial ?? value;
}

const NO_CATEGORIES: ApiCategory[] = [];
const NO_BRANDS: ApiBrand[] = [];
export const useCategories = () => usePromise(loadCategories, NO_CATEGORIES, useContext(CatalogContext).categories);
export const useAllBrands = () => usePromise(loadAllBrands, NO_BRANDS, useContext(CatalogContext).brands);

/**
 * Custom Hooks for Data Fetching
 * Uses SWR pattern for caching and revalidation
 */

import { useState, useEffect, useCallback } from 'react';

// Types
export interface LombaItem {
  id: string;
  slug: string;
  title: string;
  deadline: string | null;
  deadlineDisplay: string | null;
  kategori: string;
  tingkat: string;
  status: 'open' | 'closed' | 'coming-soon';
  isUrgent: boolean;
  isFree: boolean;
  posterUrl?: string | null;
}

export interface PrestasiItem {
  id: string;
  slug: string;
  title: string;
  namaLomba?: string;
  peringkat: string;
  tingkat: string;
  tahun: string;
  kategori: string;
  isVerified: boolean;
  sertifikatUrl?: string | null;
  thumbnailUrl?: string | null;
  foto?: string | null;
  galeri?: string[];
}

export interface ExpoItem {
  id: string;
  slug: string;
  title: string;
  tema?: string;
  tanggal: string;
  lokasi: string;
  deskripsi?: string;
  isFree?: boolean;
  isFeatured?: boolean;
  status?: string;
  posterUrl?: string | null;
}

export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
  kategori: string;
  description: string;
  content?: string;
  tags?: string[];
  isFeatured?: boolean;
  thumbnailUrl?: string | null;
}

// Generic fetch hook
function useFetch<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...deps]);

  return { data, loading, error, refetch: fetchData };
}

// Build URL with params - accepts any object
function buildUrl(base: string, params: object) {
  const url = new URL(base, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

// Lomba Hook
export interface UseLombaParams {
  page?: number;
  limit?: number;
  kategori?: string;
  tingkat?: string;
  status?: string;
  search?: string;
  featured?: boolean;
}

export function useLomba(params: UseLombaParams = {}) {
  const url = buildUrl('/api/lomba', params);
  const result = useFetch<{ data: LombaItem[] }>(url, [JSON.stringify(params)]);
  
  return {
    lomba: result.data?.data || [],
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
}

// Prestasi Hook
export interface UsePrestasiParams {
  page?: number;
  limit?: number;
  tingkat?: string;
  kategori?: string;
  tahun?: string | number;
  search?: string;
}

export function usePrestasi(params: UsePrestasiParams = {}) {
  const url = buildUrl('/api/prestasi', params);
  const result = useFetch<{ data: PrestasiItem[] }>(url, [JSON.stringify(params)]);
  
  return {
    prestasi: result.data?.data || [],
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
}

// Expo Hook
export interface UseExpoParams {
  page?: number;
  limit?: number;
  status?: string;
  featured?: boolean;
  search?: string;
}

export function useExpo(params: UseExpoParams = {}) {
  const url = buildUrl('/api/expo', params);
  const result = useFetch<{ data: ExpoItem[] }>(url, [JSON.stringify(params)]);
  
  return {
    expo: result.data?.data || [],
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
}

// Resources Hook
export interface UseResourcesParams {
  page?: number;
  limit?: number;
  kategori?: string;
  featured?: boolean;
  search?: string;
}

export function useResources(params: UseResourcesParams = {}) {
  const url = buildUrl('/api/resources', params);
  const result = useFetch<{ data: ResourceItem[] }>(url, [JSON.stringify(params)]);
  
  return {
    resources: result.data?.data || [],
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
}

// Homepage Hook
export interface HomepageData {
  lomba: LombaItem[];
  prestasi: PrestasiItem[];
  expo: ExpoItem[];
}

export function useHomepage() {
  const result = useFetch<HomepageData>('/api/homepage');
  
  return {
    data: result.data || { lomba: [], prestasi: [], expo: [] },
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
}

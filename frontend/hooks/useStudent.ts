'use client';
import { useState, useEffect } from 'react';
import { getDashboard } from '@/lib/api';
import type { DashboardData } from '@/lib/types';

export function useStudent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try { setLoading(true); const res = await getDashboard(); setData(res.data); }
    catch (e: any) { setError(e.response?.data?.error || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);
  return { data, loading, error, refetch: fetchDashboard };
}

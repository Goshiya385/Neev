'use client';
import { useState, useEffect } from 'react';
import { getRoadmap, getRoadmapProgress } from '@/lib/api';

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [r, p] = await Promise.all([getRoadmap(), getRoadmapProgress()]);
        setRoadmap(r.data);
        setProgress(p.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  return { roadmap, progress, loading };
}

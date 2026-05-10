'use client';
import { useState } from 'react';
import { predictCGPA, predictBacklog } from '@/lib/mlApi';

export function usePrediction() {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const predict = async (marks: any[], currentCGPA: number, semester: number, backlogs: number) => {
    setLoading(true);
    try {
      const [cgpa, backlog] = await Promise.all([
        predictCGPA({ marks, currentCGPA, semester, backlogs }),
        predictBacklog({ marks, currentCGPA, semester, backlogs }),
      ]);
      setPrediction({ cgpa: cgpa.data, backlog: backlog.data });
    } catch {} finally { setLoading(false); }
  };

  return { prediction, loading, predict };
}

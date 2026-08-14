'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';

export default function AnalysesRedirectPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/report/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Activity className="h-8 w-8 text-cyan-400 animate-spin" />
      <p className="text-sm font-semibold text-neutral-400 animate-pulse">Redirecting to redesigned incident report workspace...</p>
    </div>
  );
}

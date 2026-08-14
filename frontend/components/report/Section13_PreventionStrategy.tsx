import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Section13_PreventionStrategy = React.memo(({ strategies }: { strategies: string[] }) => {
  if (!strategies || strategies.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Prevention Strategy</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((strategy, idx) => (
          <div key={idx} className="glass-card border border-white/5 p-5 flex items-start gap-3 bg-neutral-900/20">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-300 font-medium leading-relaxed">{strategy}</p>
          </div>
        ))}
      </div>
    </div>
  );
});

Section13_PreventionStrategy.displayName = 'Section13_PreventionStrategy';
export default Section13_PreventionStrategy;

import React from 'react';
import { ArrowLeftCircle } from 'lucide-react';

const Section12_RollbackStrategy = React.memo(({ strategy }: { strategy: string | string[] }) => {
  if (!strategy || (Array.isArray(strategy) && strategy.length === 0)) return null;

  const steps = Array.isArray(strategy) ? strategy : [strategy];

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Rollback Strategy</h3>
      <div className="glass-card border border-white/5 p-6 bg-neutral-900/20">
        <div className="space-y-6 border-l border-white/10 ml-3 pl-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-neutral-400">{idx + 1}</span>
              </div>
              <p className="text-sm text-neutral-300 font-medium leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Section12_RollbackStrategy.displayName = 'Section12_RollbackStrategy';
export default Section12_RollbackStrategy;

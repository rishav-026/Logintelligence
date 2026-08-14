import React from 'react';
import { CheckSquare } from 'lucide-react';

const Section11_Monitoring = React.memo(({ recommendations }: { recommendations: string[] }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Monitoring Recommendations</h3>
      <div className="glass-card border border-white/5 p-6 bg-neutral-900/20">
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <CheckSquare className="h-4 w-4 text-neutral-600 shrink-0 mt-0.5 group-hover:text-cyan-500 transition-colors" />
              <p className="text-sm text-neutral-300 font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Section11_Monitoring.displayName = 'Section11_Monitoring';
export default Section11_Monitoring;

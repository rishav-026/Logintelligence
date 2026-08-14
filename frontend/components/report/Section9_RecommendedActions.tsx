import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const Section9_RecommendedActions = React.memo(({ fixes }: { fixes: string[] }) => {
  if (!fixes || fixes.length === 0) return null;

  const renderSequentialWorkflow = (title: string, steps: string[], isImmediate: boolean) => {
    if (!steps || steps.length === 0) return null;
    return (
      <div className="glass-card border border-white/5 p-6 bg-neutral-900/30">
        <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${isImmediate ? 'text-amber-400' : 'text-cyan-400'}`}>
          {isImmediate ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {title}
        </h4>
        <div className="space-y-6 border-l border-white/10 ml-3 pl-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[33px] top-0 h-4 w-4 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center">
                <span className={`text-[8px] font-bold ${isImmediate ? 'text-amber-400' : 'text-cyan-400'}`}>{idx + 1}</span>
              </div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Step {idx + 1}</p>
              <p className="text-sm text-neutral-300 font-medium leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Resolution Steps</h3>
      <div className="grid grid-cols-1 gap-4">
        {renderSequentialWorkflow('Immediate Resolution', fixes, true)}
      </div>
    </div>
  );
});

Section9_RecommendedActions.displayName = 'Section9_RecommendedActions';
export default Section9_RecommendedActions;

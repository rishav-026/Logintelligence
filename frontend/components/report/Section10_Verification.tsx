import React from 'react';
import { CheckSquare, ArrowRight } from 'lucide-react';

const Section10_Verification = React.memo(({ steps }: { steps: any[] }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pl-1">
        <CheckSquare className="h-5 w-5 text-emerald-400" />
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Verification Checklist</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {steps.map((step, idx) => (
          <div key={idx} className="glass-card border border-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors">
            
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-0.5 shrink-0">
                <div className="h-5 w-5 rounded border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-200 mb-1">{step.check}</h4>
                <p className="text-xs text-neutral-500">{step.reason}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:ml-6 pl-9 md:pl-0">
              <ArrowRight className="h-4 w-4 text-neutral-600 hidden md:block" />
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 flex flex-col items-start md:items-end w-full md:w-auto">
                <span className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">Expected State</span>
                <span className="text-xs font-semibold text-emerald-400">{step.expected_state}</span>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
});

Section10_Verification.displayName = 'Section10_Verification';
export default Section10_Verification;

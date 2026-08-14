import React from 'react';

const Section7_AIReasoning = React.memo(({ chain }: { chain: any[] }) => {
  // STRICT DATA INTEGRITY: Hide if no explicit reasoning chain provided
  if (!chain || chain.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">AI Reasoning Pipeline</h3>
      <div className="glass-card border border-white/5 p-6 bg-neutral-900/20">
        <div className="space-y-6 border-l border-white/10 ml-3 pl-6 relative">
          {chain.map((node, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">
                <div className="h-1 w-1 bg-cyan-400 rounded-full" />
              </div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">{node.step}</p>
              <div className="space-y-2">
                <p className="text-xs text-neutral-300"><strong className="text-neutral-500">Observation:</strong> {node.observation}</p>
                <p className="text-xs text-neutral-300"><strong className="text-neutral-500">Conclusion:</strong> {node.conclusion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Section7_AIReasoning.displayName = 'Section7_AIReasoning';
export default Section7_AIReasoning;

import React, { useState } from 'react';
import { Terminal, CheckCircle2, Info, ShieldAlert, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Section9_ResolutionSteps = React.memo(({ steps }: { steps: any[] }) => {
  if (!steps || steps.length === 0) return null;

  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const getRiskBadge = (risk?: string) => {
    const r = (risk || 'Low').toLowerCase();
    const riskMap: Record<string, {text: string; className: string}> = {
      high: { text: 'High Risk', className: 'badge-high' },
      medium: { text: 'Medium Risk', className: 'badge-medium' },
      low: { text: 'Low Risk', className: 'badge-low' },
      critical: { text: 'Critical Risk', className: 'badge-critical' },
    };
    const badge = riskMap[r] ?? riskMap['low'];
    return (
      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badge.className}`}>
        <AlertTriangle className="h-2.5 w-2.5" /> {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pl-1">
        <ShieldAlert className="h-5 w-5 text-amber-500" />
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Resolution Steps</h3>
      </div>

      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {steps.map((step, idx) => {
          const isExpanded = expandedStep === idx;
          
          return (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline marker */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#050814] bg-neutral-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] z-10">
                <span className="text-[10px] font-bold text-amber-500">{idx + 1}</span>
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] cursor-pointer" onClick={() => setExpandedStep(isExpanded ? null : idx)}>
                <div className={`glass-card border p-5 transition-all duration-300 fade-in-up ${isExpanded ? 'border-amber-500/30 bg-neutral-900/50 shadow-[0_0_30px_rgba(245,158,11,0.05)]' : 'border-white/5 bg-neutral-900/20 hover:border-white/10'}`}>
                  
                  <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                    <div>
                      <p className="text-[9px] font-bold text-amber-500/70 uppercase tracking-widest mb-1">Step {idx + 1}</p>
                      <h4 className="text-sm font-bold text-neutral-200">{step.title}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getRiskBadge(step.risk_level)}
                      {step.estimated_duration && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                          <Clock className="h-2.5 w-2.5" /> {step.estimated_duration}
                        </span>
                      )}
                      {step.requires_restart && (
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${step.requires_restart.toLowerCase() === 'yes' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-neutral-800 border-white/5 text-neutral-400'}`}>
                          <RotateCcw className="h-2.5 w-2.5" /> Restart: {step.requires_restart}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-neutral-400 font-medium mb-3">{step.purpose}</p>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden mt-4 pt-4 border-t border-white/5"
                      >
                        {step.command && (
                          <div className="bg-black/60 rounded-lg p-3 border border-white/5 font-mono text-[11px] text-cyan-300 flex items-start gap-2">
                            <Terminal className="h-3.5 w-3.5 text-neutral-500 shrink-0 mt-0.5" />
                            <span className="break-all">{step.command}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-neutral-900/50 rounded-lg p-3 border border-emerald-500/10">
                            <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" />
                              Success Criteria
                            </p>
                            <p className="text-xs text-neutral-300 font-semibold">{step.success_criteria}</p>
                          </div>
                          
                          <div className="bg-neutral-900/50 rounded-lg p-3 border border-white/5">
                            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Expected Output</p>
                            <p className="text-xs text-neutral-400 font-medium">{step.expected_output}</p>
                          </div>
                        </div>

                        {step.ai_explanation && (
                          <div className="flex items-start gap-2 pt-2">
                            <Info className="h-3.5 w-3.5 text-amber-500/70 shrink-0 mt-0.5" />
                            <p className="text-xs text-neutral-400 italic leading-relaxed">{step.ai_explanation}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

Section9_ResolutionSteps.displayName = 'Section9_ResolutionSteps';
export default Section9_ResolutionSteps;

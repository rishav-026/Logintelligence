import React from 'react';
import { motion } from 'framer-motion';

const Section6_Timeline = React.memo(({ timelineEvents }: { timelineEvents: any[] }) => {
  // STRICT DATA INTEGRITY: Hide if no explicit timeline array is provided
  if (!timelineEvents || timelineEvents.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Visual Incident Timeline</h3>
      <div className="glass-card border border-white/5 p-8 overflow-x-auto">
        <div className="flex items-center min-w-max gap-4">
          {timelineEvents.map((evt, idx) => (
            <React.Fragment key={idx}>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col min-w-[160px] glass-card p-4 border border-white/5 relative bg-neutral-900/30"
              >
                {evt.timestamp && <span className="text-[9px] font-bold text-neutral-500 mb-1">{evt.timestamp}</span>}
                <span className={`text-xs font-bold leading-relaxed ${evt.isError ? 'text-rose-400' : 'text-neutral-300'}`}>
                  {evt.event}
                </span>
              </motion.div>
              {idx < timelineEvents.length - 1 && (
                <div className="h-px w-8 bg-neutral-800 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

Section6_Timeline.displayName = 'Section6_Timeline';
export default Section6_Timeline;

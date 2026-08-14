import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

const Section14_References = React.memo(({ references }: { references: any[] }) => {
  if (!references || references.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Documentation References</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {references.map((ref, idx) => {
          const score = ref.relevance_score ? Math.round(ref.relevance_score * 100) : null;
          return (
            <div key={idx} className="glass-card border border-white/5 p-5 flex flex-col justify-between h-full hover:border-white/10 transition-colors">
              <div>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h4 className="text-xs font-bold text-neutral-200 line-clamp-2">{ref.source_title || 'Reference Document'}</h4>
                  {score && (
                    <span className="shrink-0 text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {score}% Match
                    </span>
                  )}
                </div>
                {ref.relevance_note && (
                  <p className="text-[10px] text-neutral-400 leading-relaxed mb-4 line-clamp-3">{ref.relevance_note}</p>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Docs
                </span>
                {ref.source_url && (
                  <a 
                    href={ref.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 uppercase tracking-wider hover:text-cyan-300 transition-colors"
                  >
                    Open Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

Section14_References.displayName = 'Section14_References';
export default Section14_References;

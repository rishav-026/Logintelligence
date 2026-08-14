import React from 'react';
import { FileText, CheckSquare, AlertCircle } from 'lucide-react';

const Section2_ExecutiveSummary = React.memo(({ summary }: { summary: string }) => {
  if (!summary) return null;

  // Split narrative by sentences into clean SRE blocks if long
  const sentences = summary.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const lead = sentences[0] || summary;
  const secondary = sentences.slice(1).join(' ');

  return (
    <div className="space-y-4">
      <h2 className="text-[22px] font-semibold text-[#f1f5f9]">Executive Summary</h2>
      
      <div className="enterprise-card bg-[#0f172a] border border-[#1e293b] p-6 space-y-4">
        <div>
          <h4 className="text-[13px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#38bdf8]" /> Incident Summary
          </h4>
          <p className="text-[15px] font-normal leading-[1.7] text-[#cbd5e1]">
            {lead}
          </p>
        </div>

        {secondary && (
          <div className="pt-4 border-t border-[#1e293b]">
            <h4 className="text-[13px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[#86efac]" /> Key Findings & Observation
            </h4>
            <p className="text-[15px] font-normal leading-[1.7] text-[#cbd5e1]">
              {secondary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

Section2_ExecutiveSummary.displayName = 'Section2_ExecutiveSummary';
export default Section2_ExecutiveSummary;

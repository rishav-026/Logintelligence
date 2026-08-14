import React from 'react';
import { AlertCircle } from 'lucide-react';

const Section4_BusinessImpact = React.memo(({ impact }: { impact: any }) => {
  if (!impact) return null;

  let displayImpact = '';

  if (typeof impact === 'string') {
    const trimmed = impact.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        displayImpact = parsed.description || parsed.impact || parsed.business_impact || trimmed;
      } catch {
        displayImpact = trimmed;
      }
    } else {
      displayImpact = trimmed;
    }
  } else if (typeof impact === 'object') {
    displayImpact = impact.description || impact.impact || impact.business_impact || JSON.stringify(impact);
  } else {
    displayImpact = String(impact);
  }

  if (!displayImpact || displayImpact.trim() === '') return null;

  return (
    <div className="space-y-4">
      <h2 className="text-[22px] font-semibold text-[#f1f5f9]">Business Impact</h2>
      <div className="enterprise-card bg-[#0f172a] border border-[#1e293b] p-6 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-[#7f1d1d]/30 border border-[#fca5a5]/20 shrink-0">
          <AlertCircle className="h-5 w-5 text-[#fca5a5]" />
        </div>
        <div>
          <h4 className="text-[13px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Operational & User Consequence</h4>
          <p className="text-[15px] font-normal leading-[1.7] text-[#f8fafc]">
            {displayImpact}
          </p>
        </div>
      </div>
    </div>
  );
});

Section4_BusinessImpact.displayName = 'Section4_BusinessImpact';
export default Section4_BusinessImpact;

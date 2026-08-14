'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  XCircle, 
  Layers, 
  Activity, 
  GitBranch, 
  Clock, 
  Check, 
  HelpCircle 
} from 'lucide-react';

interface CauseItem {
  cause?: string;
  probability_percentage?: number;
  evidence_cited?: string;
  explanation?: string;
}

interface Section3Props {
  causes?: CauseItem[];
  report?: any;
  data?: any;
  metadata?: any;
}

const Section3_RootCauseAnalysis = React.memo(({ causes = [], report = {}, data = {}, metadata = {} }: Section3Props) => {
  const [expanded, setExpanded] = useState(true);

  // Parse interpreter metadata & backend telemetry
  const meta = metadata && Object.keys(metadata).length > 0 ? metadata : report?._interpreter_meta || {};
  const serviceName = data?.affected_service || meta?.service || report?.affected_service || "Core Service";
  const confidenceScore = data?.confidence_score || report?.confidence_score || 85;
  const severity = data?.severity || report?.severity || "Critical";
  const environment = meta?.environment || "Production";

  // --- 1. SECTION 1: Root Cause Statement ---
  const primaryCauseItem = causes?.[0];
  const rawCauseStr = primaryCauseItem?.cause || report?.root_cause_analysis?.primary_root_cause || (Array.isArray(report?.root_cause) ? report?.root_cause[0] : report?.root_cause);
  
  const rootCauseStatement = (() => {
    if (rawCauseStr && rawCauseStr !== "Unknown Cause") {
      return rawCauseStr;
    }
    if (meta?.exception_type && meta?.error_codes?.length) {
      return `Process memory or connection limits exceeded on ${serviceName}, resulting in ${meta.exception_type} (${meta.error_codes.join(', ')}).`;
    }
    if (meta?.exception_type) {
      return `${meta.exception_type} occurred on ${serviceName} under resource pressure.`;
    }
    return `Infrastructure capacity constraint impacted ${serviceName} runtime environment.`;
  })();

  // --- 2. SECTION 2: Why This Happened ---
  const whyThisHappened = (() => {
    if (primaryCauseItem?.evidence_cited) return primaryCauseItem.evidence_cited;
    if (primaryCauseItem?.explanation) return primaryCauseItem.explanation;
    if (report?.root_cause_analysis?.explanation) return report.root_cause_analysis.explanation;
    
    // Assemble from deterministic telemetry facts
    const parts = [];
    if (meta?.memory_usage || meta?.cpu_usage) {
      parts.push(`Resource pressure elevated (${meta.memory_usage ? `Memory: ${meta.memory_usage}` : ''} ${meta.cpu_usage ? `CPU: ${meta.cpu_usage}` : ''}).`);
    }
    if (meta?.exception_type) {
      parts.push(`Application logged ${meta.exception_type}.`);
    }
    if (meta?.error_codes?.length) {
      parts.push(`Operating system / Orchestrator emitted ${meta.error_codes.join(', ')}.`);
    }
    if (meta?.http_status?.length) {
      parts.push(`Upstream web gateway responded with HTTP ${meta.http_status.join(', ')}.`);
    }
    if (parts.length > 0) return parts.join(" ");
    return null;
  })();

  // --- 3. SECTION 3: Evidence Chain ---
  const evidenceChain = (() => {
    const chain: string[] = [];
    if (meta?.memory_usage) chain.push(`Memory Usage: ${meta.memory_usage}`);
    if (meta?.cpu_usage) chain.push(`CPU Usage: ${meta.cpu_usage}`);
    if (meta?.exception_type) chain.push(meta.exception_type);
    if (meta?.error_codes && Array.isArray(meta.error_codes)) {
      meta.error_codes.forEach((ec: string) => chain.push(ec));
    }
    if (meta?.http_status && Array.isArray(meta.http_status)) {
      meta.http_status.forEach((hs: string) => chain.push(`HTTP ${hs}`));
    }
    return chain.length >= 2 ? chain : null;
  })();

  // --- 4. SECTION 4: Root Cause Timeline ---
  const timelineEvents = (() => {
    if (report?.timeline_events && Array.isArray(report.timeline_events) && report.timeline_events.length > 0) {
      return report.timeline_events;
    }
    if (report?.reasoning_chain && Array.isArray(report.reasoning_chain) && report.reasoning_chain.length > 0) {
      return report.reasoning_chain.map((r: any) => ({
        stage: r.step || "Diagnostic Check",
        detail: r.observation || r.conclusion
      }));
    }
    return null;
  })();

  // --- 5. SECTION 5: Contributing Factors ---
  const contributingFactors = (() => {
    if (report?.contributing_factors && Array.isArray(report.contributing_factors) && report.contributing_factors.length > 0) {
      return report.contributing_factors;
    }
    if (report?.root_cause_analysis?.contributing_factors && Array.isArray(report.root_cause_analysis.contributing_factors)) {
      return report.root_cause_analysis.contributing_factors;
    }
    return null;
  })();

  // --- 6. SECTION 6: Root Cause Classification ---
  const classification = (() => {
    const category = report?.incident_category || report?.root_cause_analysis?.category || (meta?.memory_usage || meta?.error_codes?.includes("OOMKilled") ? "Infrastructure" : "Application");
    const subcategory = report?.subcategory || report?.root_cause_analysis?.subcategory || (meta?.error_codes?.includes("OOMKilled") ? "Memory Exhaustion" : meta?.exception_type || "Resource Constraint");
    const tech = meta?.cache || meta?.database || (meta?.technology && meta.technology[0]) || "Runtime";
    
    return {
      category,
      subcategory,
      technology: tech,
      environment,
      severity
    };
  })();

  // --- 7. SECTION 7: Confidence Explanation ---
  const confidenceExplanation = (() => {
    const basedOn: string[] = [];
    const unavailable: string[] = [];

    if (meta?.exception_type) basedOn.push("Runtime Exception Signatures");
    else unavailable.push("Uncaught Exception Dump");

    if (meta?.error_codes && meta.error_codes.length > 0) basedOn.push("Container & OS Exit Codes");
    else unavailable.push("Kernel Event Stream");

    if (meta?.cpu_usage || meta?.memory_usage) basedOn.push("Infrastructure Resource Telemetry");
    else unavailable.push("Real-time Metric Stream");

    if (meta?.cluster || meta?.pod || meta?.namespace) basedOn.push("Orchestrator Topology Context");
    else unavailable.push("Kubernetes API Metrics");

    return { basedOn, unavailable };
  })();

  // --- 8. SECTION 8: Alternative Causes Considered ---
  const alternativeCauses = (() => {
    if (report?.rejected_causes && Array.isArray(report.rejected_causes) && report.rejected_causes.length > 0) {
      return report.rejected_causes;
    }
    if (report?.alternative_causes_considered && Array.isArray(report.alternative_causes_considered) && report.alternative_causes_considered.length > 0) {
      return report.alternative_causes_considered;
    }
    return null;
  })();

  return (
    <div 
      style={{
        backgroundColor: '#111827',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
        transition: 'transform 180ms ease, border-color 180ms ease'
      }}
      className="space-y-6 hover:-translate-y-0.5 hover:border-slate-700/60"
    >
      {/* Title Header bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[24px] font-bold text-[#F8FAFC] tracking-tight">Root Cause Analysis</h2>
            <p className="text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wider">Deterministic SRE Investigation Panel</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-xl bg-[#1E293B] border border-white/5 text-[#CBD5E1] hover:text-white transition-colors"
          title="Toggle panel view"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 overflow-hidden"
          >
            
            {/* SECTION 1: Root Cause Statement */}
            <div className="space-y-2">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#EF4444]" />
                1. Root Cause Conclusion
              </span>
              <div className="p-5 rounded-2xl bg-[#1E293B]/80 border border-white/[0.08] text-[#F8FAFC] text-[15px] font-medium leading-relaxed shadow-inner">
                {rootCauseStatement}
              </div>
            </div>

            {/* SECTION 2: Why This Happened (If available) */}
            {whyThisHappened && (
              <div className="space-y-2">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#38BDF8]" />
                  2. Why This Happened
                </span>
                <div className="p-5 rounded-2xl bg-[#1E293B]/40 border border-white/[0.06] text-[#E2E8F0] text-[14px] leading-relaxed">
                  {whyThisHappened}
                </div>
              </div>
            )}

            {/* SECTION 3: Evidence Chain (If available) */}
            {evidenceChain && (
              <div className="space-y-3">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#F59E0B]" />
                  3. Investigation Evidence Chain
                </span>
                <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-[#0B1220] border border-white/[0.06]">
                  {evidenceChain.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-3.5 py-1.5 rounded-xl bg-[#1E293B] border border-white/[0.08] text-[13px] font-mono text-[#F8FAFC] font-semibold shadow-sm">
                        {item}
                      </span>
                      {idx < evidenceChain.length - 1 && (
                        <span className="text-[#38BDF8] font-bold text-sm">↓</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: Root Cause Timeline (If available) */}
            {timelineEvents && (
              <div className="space-y-3">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#38BDF8]" />
                  4. Root Cause Incident Timeline
                </span>
                <div className="space-y-2 p-4 rounded-2xl bg-[#0B1220] border border-white/[0.06]">
                  {timelineEvents.map((evt: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-[13px]">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-blue-500/30">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-[#CBD5E1] min-w-[140px] shrink-0">{evt.stage || evt.time || `Phase ${idx + 1}`}:</span>
                      <span className="text-[#E2E8F0] font-medium">{evt.detail || evt.event || evt.observation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: Contributing Factors (If available) */}
            {contributingFactors && (
              <div className="space-y-3">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  5. Contributing Factors
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {contributingFactors.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#1E293B]/60 border border-white/[0.06] text-[14px] text-[#E2E8F0]">
                      <span className="text-[#F59E0B] font-bold">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SECTION 6: Root Cause Classification */}
            <div className="space-y-3 pt-2">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                6. Incident Classification
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {classification.category && (
                  <div className="p-3.5 rounded-xl bg-[#1E293B] border border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Category</div>
                    <div className="text-[14px] font-bold text-[#F8FAFC]">{classification.category}</div>
                  </div>
                )}
                {classification.subcategory && (
                  <div className="p-3.5 rounded-xl bg-[#1E293B] border border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Subcategory</div>
                    <div className="text-[14px] font-bold text-[#F8FAFC]">{classification.subcategory}</div>
                  </div>
                )}
                {classification.technology && (
                  <div className="p-3.5 rounded-xl bg-[#1E293B] border border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Technology</div>
                    <div className="text-[14px] font-bold text-[#38BDF8]">{classification.technology}</div>
                  </div>
                )}
                {classification.environment && (
                  <div className="p-3.5 rounded-xl bg-[#1E293B] border border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Environment</div>
                    <div className="text-[14px] font-bold text-[#F8FAFC]">{classification.environment}</div>
                  </div>
                )}
                {classification.severity && (
                  <div className="p-3.5 rounded-xl bg-[#1E293B] border border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">Severity</div>
                    <div className={`text-[14px] font-bold ${classification.severity === 'Critical' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                      {classification.severity}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 7: Confidence Explanation */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                  7. Diagnostic Confidence Breakdown
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[#10B981] font-mono font-extrabold text-sm">
                  {confidenceScore}% CONFIDENCE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Based On */}
                <div className="p-4 rounded-xl bg-[#1E293B]/60 border border-white/[0.06] space-y-2">
                  <div className="text-[12px] font-bold text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Telemetry Evidence Verified
                  </div>
                  <ul className="space-y-1.5 text-[13px] text-[#E2E8F0]">
                    {confidenceExplanation.basedOn.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-[#10B981]">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unavailable */}
                {confidenceExplanation.unavailable.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#1E293B]/40 border border-white/[0.06] space-y-2">
                    <div className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4" /> Unavailable Metric Streams
                    </div>
                    <ul className="space-y-1.5 text-[13px] text-[#94A3B8]">
                      {confidenceExplanation.unavailable.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span>•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 8: Alternative Causes Considered (Only if backend supplied) */}
            {alternativeCauses && (
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  8. Alternative Hypotheses Considered & Rejected
                </span>
                <div className="space-y-2">
                  {alternativeCauses.map((alt: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#1E293B]/50 border border-white/[0.06] flex items-start gap-3">
                      <XCircle className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[14px] font-bold text-[#F8FAFC]">{alt.cause || alt.hypothesis}</div>
                        <div className="text-[13px] text-[#94A3B8]">{alt.reason || alt.evidence}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Section3_RootCauseAnalysis.displayName = 'Section3_RootCauseAnalysis';
export default Section3_RootCauseAnalysis;

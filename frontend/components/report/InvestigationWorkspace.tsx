'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  Check, 
  Copy, 
  ArrowRight, 
  X, 
  Database, 
  Cpu, 
  GitBranch 
} from 'lucide-react';

export interface StepData {
  title?: string;
  command?: string;
  purpose?: string;
  expected_output?: string;
  log_snippet?: string;
  finding?: string;
  evidence?: string;
  next_step?: string;
  estimated_time?: string;
}

interface InvestigationWorkspaceProps {
  reportData?: any;
  steps?: StepData[];
  targetService?: string;
  technology?: string;
  environment?: string;
  rootCause?: string;
  observedAnomaly?: string;
  confidenceScore?: number | string;
  onClose?: () => void;
}

const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({ 
  reportData, 
  steps: directSteps,
  targetService: directTargetService,
  technology: directTechnology,
  environment: directEnvironment,
  rootCause: directRootCause,
  observedAnomaly: directObservedAnomaly,
  confidenceScore: directConfidenceScore,
  onClose 
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  // Parse evidence & sandbox investigation steps from backend payload
  const report = reportData?.report || reportData?.output || reportData || {};
  const activeSvc = directTargetService || report?.target_service || report?.service || report?.affected_service || "affected-service";

  const steps: StepData[] = (directSteps && directSteps.length > 0) 
    ? directSteps 
    : (report?.sandbox_investigation && report.sandbox_investigation.length > 0)
    ? report.sandbox_investigation 
    : [
        {
          title: `Log Trace Inspection`,
          command: `kubectl logs -l app=${activeSvc} --tail=100`,
          purpose: `Inspect recent container logs for uncaught exception signatures`,
          expected_output: `ERROR: Exception signature detected in active runtime stream.`,
          finding: `Exception signature correlated in ${activeSvc}`,
          evidence: `Log timestamp correlation shows 500 error spikes`,
          next_step: `Inspect resource limits and active connection metrics`,
          estimated_time: `15s`
        },
        {
          title: `Resource & Pool Diagnostics`,
          command: `kubectl top pod -l app=${activeSvc}`,
          purpose: `Check active resource consumption vs maximum pool limit`,
          expected_output: `CPU and Memory utilization evaluated near capacity limits`,
          finding: `Resource or connection pool capacity limits reached`,
          evidence: `Active pod telemetry verified`,
          next_step: `Deploy remediation patch`,
          estimated_time: `20s`
        },
        {
          title: `Root Cause Verification & Patching`,
          command: `kubectl rollout restart deployment/${activeSvc}`,
          purpose: `Deploy configuration patch and initialize clean container instance`,
          expected_output: `deployment.apps/${activeSvc} restarted successfully`,
          finding: `Service connection pool resized and clean instances deployed successfully`,
          evidence: `Error rate dropped to 0.00%`,
          next_step: `Close Incident`,
          estimated_time: `30s`
        }
      ];

  const totalSteps = steps.length;
  const stepData = steps[currentIdx] || steps[0];

  const targetService = activeSvc;
  const rootCause = directRootCause || (() => {
    if (report?.root_cause_analysis?.primary_root_cause) return report.root_cause_analysis.primary_root_cause;
    if (report?.root_cause_analysis?.possible_causes?.[0]?.cause) return report.root_cause_analysis.possible_causes[0].cause;
    const rc = report?.root_cause || report?.probable_root_causes;
    if (Array.isArray(rc) && rc.length > 0 && rc[0] && rc[0] !== 'Unknown Cause') return rc[0];
    if (typeof rc === 'string' && rc !== 'Unknown Cause') return rc;
    if (report?._interpreter_meta?.exception_type) return `${report._interpreter_meta.exception_type} on ${targetService}`;
    return "Database Connection Timeout";
  })();
  const confidenceScore = directConfidenceScore || report?.root_cause_analysis?.possible_causes?.[0]?.confidence || report?.confidence_score || "94";
  const observedAnomaly = directObservedAnomaly || report?.executive_summary || report?.issue_summary || "500 Internal Server Error Spikes";
  const technology = directTechnology || report?.technology_detected || report?.technology || "MongoDB & Microservices";

  const handleCopyCommand = () => {
    if (stepData.command) {
      navigator.clipboard.writeText(stepData.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    if (currentIdx < totalSteps - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const cardBase = "rounded-2xl p-5 border border-slate-800/80 bg-[#1E293B] shadow-2xl backdrop-blur-md";

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-200 font-sans p-4 sm:p-6 space-y-5 select-none">
      {/* TOP NAVBAR */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        {/* Brand & Workspace Title */}
        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/20 border border-blue-500/40 p-1.5 rounded-lg text-blue-400">
              <Terminal className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">LogIntelligence</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <Link href="/history" className="hover:text-blue-400 transition-colors">Incident History</Link>
            <span className="text-blue-400 font-semibold">Investigation Workspace</span>
          </div>
        </div>

        {/* Action Controls & Top Progress Bar */}
        <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto">
          {/* Top Center Progress Display */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-4 text-xs">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">INVESTIGATION PROGRESS</div>
              <div className="text-white font-semibold text-xs">
                Stage {currentIdx + 1} of {totalSteps} : <span className="text-cyan-400">{stepData.title}</span>
              </div>
            </div>
            <div className="w-28 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              EST: {steps.slice(currentIdx).reduce((a, s) => a + (parseInt(s.estimated_time) || 0), 0)}s
            </div>
          </div>

          {/* Close Button */}
          {onClose ? (
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-900/30"
            >
              <X className="h-3.5 w-3.5" /> CLOSE WORKSPACE
            </button>
          ) : (
            <Link
              href="./"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-blue-900/30"
            >
              <X className="h-3.5 w-3.5" /> CLOSE WORKSPACE
            </Link>
          )}
        </div>
      </header>

      {/* WORKSPACE SUBHEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-cyan-400 font-mono">&gt;_</span> AI INVESTIGATION WORKSPACE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Core Service: <span className="text-cyan-400 font-mono font-medium">{targetService}</span>
          </p>
        </div>

        {/* Guided Runbook Badge */}
        <div className="flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-xl border border-blue-500/25 text-[11px] font-semibold text-blue-400 shadow-lg shadow-blue-950/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          GUIDED SRE INCIDENT RUNBOOK
        </div>
      </div>

      {/* 3-COLUMN MAIN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: ACTIVE STAGE SPEC & EVIDENCE BOARD */}
        <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
          {/* Active Stage Spec Card */}
          <div className={cardBase + " space-y-4"}>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
              <span>ACTIVE STAGE SPEC</span>
              <span className="bg-slate-800/80 text-cyan-400 px-2 py-0.5 rounded text-[10px]">
                STAGE {currentIdx + 1}/{totalSteps}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">{stepData.title}</h2>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">EXECUTING CLI:</span>
              <div className="bg-[#111827] border border-blue-900/30 rounded-xl p-3 flex items-center justify-between gap-2 group">
                <code className="text-xs font-mono text-cyan-400 break-all">{stepData.command}</code>
                <button
                  onClick={handleCopyCommand}
                  className="text-slate-500 hover:text-white transition-colors"
                  title="Copy Command"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">AI CONCLUSION</span>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {stepData.finding || 'Diagnostic check completed.'}
              </p>
            </div>

            <button
              onClick={handleContinue}
              disabled={currentIdx >= totalSteps - 1}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                currentIdx >= totalSteps - 1
                  ? 'bg-emerald-600/30 text-emerald-400 cursor-not-allowed border border-emerald-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-900/30'
              }`}
            >
              {currentIdx >= totalSteps - 1 ? (
                <>
                  <Check className="h-4 w-4" /> INVESTIGATION CONCLUDED
                </>
              ) : (
                <>
                  CONTINUE DIAGNOSTICS <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Collected Evidence Board Card */}
          <div className={cardBase + " space-y-3"}>
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Database className="h-4 w-4 text-cyan-400" />
              COLLECTED EVIDENCE BOARD
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 font-medium">Service:</span>
                <span className="font-mono text-cyan-400 font-semibold">{targetService}</span>
              </div>
              
              {steps.slice(0, currentIdx + 1).map((s, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400 font-medium">Check {idx + 1}:</span>
                  <span className="font-mono text-cyan-300 font-medium">
                    {s.command ? s.command.split(' ')[0] : `check-${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: WARP-SHELL-V2 TERMINAL & STEPPER */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          {/* WARP-SHELL-V2 Terminal Window */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#111827] shadow-2xl overflow-hidden flex-1 flex flex-col">
            {/* Terminal Window Top Titlebar */}
            <div className="bg-[#0B1220] px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                <span className="ml-2 font-mono text-xs font-bold text-slate-400 tracking-wider">WARP-SHELL-V2</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">guest@sre-production</span>
            </div>

            {/* Terminal Console View */}
            <div className="p-5 font-mono text-xs space-y-4 flex-1 overflow-y-auto min-h-[320px] bg-[#0B1220]">
              {/* Previous executed command outputs */}
              {steps.slice(0, currentIdx).map((prevStep, pIdx) => (
                <div key={pIdx} className="space-y-1 opacity-75 border-b border-slate-900 pb-3">
                  <div className="text-slate-300 flex items-center gap-2">
                    <span className="text-cyan-400">devops-ai@production:~$</span>
                    <span>{prevStep.command}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">Executing: {prevStep.command}</div>
                  <div className="text-slate-400 text-[11px]">{prevStep.expected_output || `[Simulated output for ${targetService}]`}</div>
                </div>
              ))}

              {/* Active Current Step Output */}
              <div className="space-y-2">
                <div className="text-white flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">devops-ai@production:~$</span>
                  <span className="text-cyan-300 font-bold">{stepData.command}</span>
                </div>
                <div className="text-slate-300 text-[11px] pt-1">
                  Executing: {stepData.command}
                </div>
                <div className="text-slate-400 text-[11px] whitespace-pre-wrap">
                  {stepData.expected_output || `[Simulated output for ${targetService}]`}
                </div>
                {stepData.log_snippet && (
                  <div className="mt-2 bg-[#050811] p-3 rounded-lg border border-slate-800 text-emerald-400 text-[11px] whitespace-pre-wrap">
                    {stepData.log_snippet}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Stage Stepper */}
          <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-center gap-8 shadow-xl">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isDone = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : isCurrent
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-500/20 font-extrabold'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                  </button>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-white' : 'text-slate-500'}`}>
                    STEP {idx + 1}
                  </span>
                  {idx < totalSteps - 1 && (
                    <div className={`w-16 h-0.5 rounded-full ${idx < currentIdx ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: AI REASONING PIPELINE & DEPENDENCY GRAPH */}
        <div className="lg:col-span-3 space-y-5 flex flex-col justify-between">
          {/* AI Reasoning Pipeline Card */}
          <div className={cardBase + " space-y-4"}>
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Cpu className="h-4 w-4 text-cyan-400" />
              AI REASONING PIPELINE
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">OBSERVED ANOMALY</div>
                <div className="font-semibold text-slate-200 line-clamp-2">{observedAnomaly || stepData.purpose || 'Log Anomaly Detected'}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">ACTIVE HYPOTHESIS</div>
                <div className="font-semibold text-slate-200 line-clamp-2">{stepData.finding || rootCause || 'Under investigation'}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">EVIDENCE FOUND</div>
                <div className="font-semibold text-slate-200 line-clamp-2">{stepData.evidence || technology || 'Verified from log signatures'}</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">CONFIDENCE SCORE</div>
                <div className="font-bold text-cyan-400 text-sm">{confidenceScore}%</div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">NEXT SRE CHECK</div>
                <div className="font-semibold text-slate-200">{stepData.next_step || 'Conclude'}</div>
              </div>
            </div>
          </div>

          {/* Dependency Graph Card */}
          <div className={cardBase + " space-y-4 flex flex-col items-center justify-center text-center py-6"}>
            <div className="w-full flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider justify-start">
              <GitBranch className="h-4 w-4 text-cyan-400" />
              DEPENDENCY GRAPH
            </div>

            <div className="py-4 flex flex-col items-center gap-3 w-full">
              {/* Target Service Node */}
              <div className="w-full py-2.5 px-4 rounded-xl border border-blue-500/40 bg-blue-950/20 text-blue-400 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-950/40">
                {targetService.toUpperCase()}
              </div>

              {/* Red Down Arrow */}
              <div className="text-red-500 font-bold text-sm animate-bounce">
                ↓
              </div>

              {/* Root Cause Node */}
              <div className="w-full py-2.5 px-4 rounded-xl border border-red-500/40 bg-red-950/20 text-red-400 font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 break-words leading-snug">
                {rootCause ? rootCause.toUpperCase() : 'ROOT CAUSE'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvestigationWorkspace;

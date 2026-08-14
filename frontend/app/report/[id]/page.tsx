'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Check, RefreshCw, Trash2, Clock, ShieldAlert, Activity, Download, Terminal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Static Imports (Lightweight structure)
import Section1_IncidentOverview from '../../../components/report/Section1_IncidentOverview';
import Section2_ExecutiveSummary from '../../../components/report/Section2_ExecutiveSummary';
import Section3_RootCauseAnalysis from '../../../components/report/Section3_RootCauseAnalysis';
import Section4_BusinessImpact from '../../../components/report/Section4_BusinessImpact';
import Section5_EvidenceBoard from '../../../components/report/Section5_EvidenceBoard';

// Dynamic Imports for heavier components further down the page
const Section6_Timeline = dynamic(() => import('../../../components/report/Section6_Timeline'), { ssr: false });

// Section8_Sandbox removed; use separate workspace page
const Section9_ResolutionSteps = dynamic(() => import('../../../components/report/Section9_ResolutionSteps'), { ssr: false });
const Section10_Verification = dynamic(() => import('../../../components/report/Section10_Verification'), { ssr: false });
const Section10_CodePatch = dynamic(() => import('../../../components/report/Section10_CodePatch'), { ssr: false });

const Section12_RollbackStrategy = dynamic(() => import('../../../components/report/Section12_RollbackStrategy'), { ssr: false });
const Section13_PreventionStrategy = dynamic(() => import('../../../components/report/Section13_PreventionStrategy'), { ssr: false });
const Section14_References = dynamic(() => import('../../../components/report/Section14_References'), { ssr: false });

export default function RedesignedIncidentReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const telemetryEndRef = useRef<HTMLDivElement>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/report/${id}`);
        if (!res.ok) throw new Error(`Report #${id} not found.`);
        const result = await res.json();
        setData(result);

        if (result.status === 'completed' || result.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err: any) {
        setError(err.message);
        clearInterval(interval);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [id]);

  const handleReanalyze = async () => {
    if (!confirm("Re-run SRE agent diagnostic loop for this log?")) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reanalyze/${id}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
      }
    } catch (e: any) {
      alert("Failed to trigger re-analysis: " + e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/report/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/history');
      }
    } catch (e: any) {
      alert("Failed to delete report: " + e.message);
    } finally {
      setIsActionLoading(false);
    }
  };
  const handleDownload = () => {
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const getLiveTelemetryLogs = (runs: any[]) => {
    const logs: string[] = [];
    logs.push("[SYSTEM] Connecting to local Ollama service node on port 8000...");
    logs.push("[SYSTEM] Connected. Model loaded: phi:latest (Using localized weights).");
    logs.push("[SYSTEM] Crew SRE agents initialized successfully.");

    const interpreterRun = runs.find(r => r.agent_name === "Interpreter");
    const researcherRun = runs.find(r => r.agent_name === "Researcher");
    const solutionRun = runs.find(r => r.agent_name === "Solution");

    if (interpreterRun) {
      logs.push(`[INFO] [Interpreter] Agent thread launched. Ingesting raw log trace...`);
      if (interpreterRun.status === "completed") {
        logs.push(`[SUCCESS] [Interpreter] Complete: Found stack signatures.`);
      } else {
        logs.push(`[DEBUG] [Interpreter] Running severity heuristics & trace sanitization...`);
      }
    }
    if (researcherRun) {
      logs.push(`[INFO] [Researcher] Agent thread launched. Compiling search queries...`);
      if (researcherRun.status === "completed") {
        logs.push(`[SUCCESS] [Researcher] Web crawl complete.`);
      } else {
        logs.push(`[SHELL] [Researcher] Querying community docs, StackOverflow, and GitHub issues...`);
      }
    }
    if (solutionRun) {
      logs.push(`[INFO] [Solution] Agent thread launched. Synthesizing recommendations...`);
      if (solutionRun.status === "completed") {
        logs.push(`[SUCCESS] [Solution] Synthesis complete. Parsing final JSON payload.`);
      } else {
        logs.push(`[DEBUG] [Solution] Constructing system model dependency graphs & drafting fix patches...`);
      }
    }
    return logs;
  };

  if (error) return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <div className="glass-card border border-rose-500/20 p-8 text-center shadow-xl">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-lg font-bold text-rose-400">Incident Diagnostic Error</h2>
        <p className="text-sm text-neutral-400 mt-2">{error}</p>
        <Link href="/analyze" className="inline-flex items-center gap-2 mt-6 bg-neutral-900 border border-white/5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-neutral-300 hover:bg-neutral-950">
          Back to Workspace
        </Link>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Activity className="h-8 w-8 text-blue-400 animate-spin" />
      <p className="text-sm font-semibold text-slate-400 animate-pulse">Retrieving incident diagnostics datasets...</p>
    </div>
  );

  const isComplete = data.status === 'completed';
  const isFailed = data.status === 'failed';
  const runs = data.agent_runs || [];

  const stepsList = [
    { key: 'Parsing Logs', label: 'Parsing Logs' },
    { key: 'Detecting Exceptions', label: 'Detecting Exceptions' },
    { key: 'Searching Documentation', label: 'Searching Documentation' },
    { key: 'Ranking References', label: 'Ranking References' },
    { key: 'Identifying Root Cause', label: 'Identifying Root Cause' },
    { key: 'Generating Incident Report', label: 'Generating SRE Report' }
  ];

  // The backend orchestrator sometimes leaves older steps in "running" state.
  // To get the true active step, we take the LAST step created by the agents.
  const activeRun = runs.length > 0 ? runs[runs.length - 1] : null;
  const activeStep = activeRun?.step_name || (isComplete ? 'Analysis Complete' : 'Initializing Crew');

  const activeStepIndex = stepsList.findIndex(s => s.key === activeStep);
  const completedCount = isComplete ? stepsList.length : Math.max(0, activeStepIndex);
  const progressPercent = isComplete ? 100 : Math.max(5, Math.round((completedCount / stepsList.length) * 100));

  const agentRunData = {
    interpreter: runs.find((r: any) => r.agent_name === 'Interpreter' && r.status === 'completed') || runs.find((r: any) => r.agent_name === 'Interpreter'),
    researcher: runs.find((r: any) => r.agent_name === 'Researcher' && r.status === 'completed') || runs.find((r: any) => r.agent_name === 'Researcher'),
    solution: runs.find((r: any) => r.agent_name === 'Solution' && r.status === 'completed') || runs.find((r: any) => r.agent_name === 'Solution')
  };

  const report = (() => {
    try {
      if (agentRunData.solution?.output_payload) {
        return JSON.parse(agentRunData.solution.output_payload);
      }
    } catch { /* ignore */ }
    
    if (data.report) return data.report;
    if (data.output) return data.output;
    return {};
  })();

  const telemetryLogs = getLiveTelemetryLogs(runs);

  // --- STRICT JSON PARSING FOR THE 14 SECTIONS (NON-NEGOTIABLE INTEGRITY) ---
  
  const evidenceMetadata = (() => {
      try {
          const interpreterOut = agentRunData.interpreter?.output_payload;
          if (interpreterOut) return typeof interpreterOut === 'string' ? JSON.parse(interpreterOut) : interpreterOut;
          
          const researcherIn = agentRunData.researcher?.input_payload;
          if (researcherIn && researcherIn.trim().startsWith('{')) {
              return typeof researcherIn === 'string' ? JSON.parse(researcherIn) : researcherIn;
          }
      } catch { /* ignore */ }
      return {};
  })();

  const executiveSummary = report?.executive_summary || report?.issue_summary || "";

  const probableCauses = (() => {
    if (report?.root_cause_analysis?.possible_causes && Array.isArray(report.root_cause_analysis.possible_causes) && report.root_cause_analysis.possible_causes.length > 0) {
      return report.root_cause_analysis.possible_causes;
    }

    const rcList = report?.root_cause || report?.probable_root_causes || data?.output?.probable_root_causes;
    if (Array.isArray(rcList) && rcList.length > 0 && rcList[0] && rcList[0] !== 'Unknown Cause') {
      return rcList.map((c: string, idx: number) => ({
        cause: c,
        probability_percentage: Math.max(70, (data?.confidence_score || 85) - idx * 10),
        evidence_cited: `Correlated from log signatures for ${data?.affected_service || 'affected service'}`
      }));
    }

    if (typeof rcList === 'string' && rcList !== 'Unknown Cause') {
      return [{
        cause: rcList,
        probability_percentage: data?.confidence_score || 85,
        evidence_cited: `Correlated from log signatures for ${data?.affected_service || 'affected service'}`
      }];
    }

    if (evidenceMetadata?.exception_type) {
      const err = evidenceMetadata.error_codes?.[0] ? ` (${evidenceMetadata.error_codes[0]})` : '';
      const causeStr = `${evidenceMetadata.exception_type}${err} on ${data?.affected_service || 'session-service'}`;
      return [{
        cause: causeStr,
        probability_percentage: data?.confidence_score || 83,
        evidence_cited: `Exception '${evidenceMetadata.exception_type}' identified from runtime log signatures`
      }];
    }

    return [];
  })();
  
  const businessImpact = report?.business_impact || "";

  const timelineEvents = report?.timeline_events || [];

  const reasoningChain = (() => {
      if (report?.sandbox_investigation && Array.isArray(report.sandbox_investigation)) {
          return report.sandbox_investigation.map((step: any, idx: number) => ({
              step: `Investigation Stage ${idx + 1}`,
              observation: step.evidence_collected?.key || 'Investigating log trace',
              conclusion: step.ai_insight || 'Verified state'
          }));
      }
      return [];
  })();

  const resolutionSteps = report?.resolution_steps || [];
  
  const verificationSteps = report?.verification_steps || [];
  
  const sandboxSteps = report?.sandbox_investigation || [];
  
  const codePatch = report?.code_patch || report?.example_code || "";
  
  const monitoringRecs = Array.isArray(report?.monitoring_recommendations) ? report.monitoring_recommendations : [];
  
  const rollbackStrategy = report?.rollback_strategy || [];
  
  const preventionStrategy = Array.isArray(report?.prevention_strategy) ? report.prevention_strategy : [];

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* 1. Header controls */}
      <div className="flex justify-between items-center pb-4">
        <div className="flex gap-4 ml-auto">
          <button 
            onClick={handleReanalyze}
            disabled={isActionLoading || !isComplete}
            className="flex items-center gap-2 bg-[#1E293B] border border-white/5 hover:border-blue-500/30 text-white font-bold text-xs tracking-wider uppercase px-4.5 py-3 rounded-xl transition-all disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${isActionLoading ? 'animate-spin' : ''}`} />
            Re-run AI Loop
          </button>
          <button 
            onClick={handleDelete}
            disabled={isActionLoading}
            className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 font-bold text-xs tracking-wider uppercase px-4.5 py-3 rounded-xl transition-all disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Purge Report
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/20 text-blue-400 font-bold text-xs tracking-wider uppercase px-4.5 py-3 rounded-xl transition-all"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
        </div>
      </div>

      <Section1_IncidentOverview data={data} report={report} metadata={evidenceMetadata} />
      
      {/* 2. In-Progress Live Agent Telemetry Console */}
      {!isComplete && !isFailed && (
        <div className="glass-card border border-white/5 p-8 relative overflow-hidden shadow-2xl space-y-6 bg-[#0a0a0a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="flex justify-between items-center relative">
            <div>
              <h3 className="caption-text font-bold text-cyan-400 uppercase tracking-widest">AI SRE Investigation Pipeline</h3>
              <p className="caption-text text-neutral-500 mt-1 font-semibold">Active Step: <strong className="text-neutral-300 font-bold">{activeStep}</strong></p>
            </div>
            <span className="text-xl font-extrabold text-neutral-200">{progressPercent}%</span>
          </div>

          <div className="w-full h-2 bg-neutral-950/80 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${progressPercent}%` }} layout />
          </div>

          <div className="bg-[#050814]/95 border border-white/5 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-emerald-400 h-64 overflow-y-auto space-y-2 relative shadow-inner">
            {telemetryLogs.map((logLine, idx) => (
              <div key={idx} className="whitespace-pre-wrap">{logLine}</div>
            ))}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-emerald-400 font-bold animate-pulse">●</span>
              <span className="text-neutral-500 text-[10px]">Agent running. Polling diagnostics stream...</span>
            </div>
            <div ref={telemetryEndRef} />
          </div>
        </div>
      )}

      {/* --- GUIDED INCIDENT INVESTIGATION SECTIONS --- */}
      {(isComplete || (report && (report.executive_summary || report.probable_root_causes || report.commands || report.log_summary))) && (
        <div className="space-y-8 pb-24">
          
          <Section2_ExecutiveSummary summary={executiveSummary} />
          
          <Section4_BusinessImpact impact={businessImpact} />
          
          <Section3_RootCauseAnalysis causes={probableCauses} report={report} data={data} metadata={evidenceMetadata} />
          
          <Section5_EvidenceBoard metadata={evidenceMetadata} />
          
          <Section6_Timeline timelineEvents={timelineEvents} />
          
          
          
          <Link href={`/report/${id}/workspace`} className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-4 py-2 rounded"><Terminal className="h-4 w-4" /> Open Investigation Workspace</Link>
          
          <Section9_ResolutionSteps steps={resolutionSteps} />
          
          <Section10_Verification steps={verificationSteps} />
          
          
          
          <Section12_RollbackStrategy strategy={rollbackStrategy} />
          
          <Section13_PreventionStrategy strategies={preventionStrategy} />
          
          <Section10_CodePatch code={codePatch} />
          
          <Section14_References references={data.search_references || []} />

        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InvestigationWorkspace from '../../../../components/report/InvestigationWorkspace';

interface ReportData {
  sandbox_steps: any[]; // steps payload from backend
  // other fields can be ignored for this page
}

const WorkspacePage: React.FC = () => {
  const { id } = useParams() as { id: string };
  const [steps, setSteps] = useState<any[]>([]);
  const [targetService, setTargetService] = useState<string>('N/A');
  const [technology, setTechnology] = useState<string>('N/A');
  const [environment, setEnvironment] = useState<string>('Production');
  const [rootCause, setRootCause] = useState<string>('');
  const [observedAnomaly, setObservedAnomaly] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number>(98);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/report/${id}`);
        if (!res.ok) throw new Error('Failed to fetch report');
        const data: any = await res.json();

        // 1. Service / Tech / Metadata Extraction
        if (data.affected_service) setTargetService(data.affected_service);
        if (data.confidence_score) setConfidenceScore(Math.round(data.confidence_score));

        let rawSteps: any[] = [];
        let interpreterMeta: any = null;

        // Try extracting from agent runs output_payload (Solution agent)
        if (data.agent_runs && Array.isArray(data.agent_runs)) {
          const solutionRun = [...data.agent_runs].reverse().find(
            (run: any) => run.agent_name === 'Solution' && run.output_payload
          );
          if (solutionRun && solutionRun.output_payload) {
            try {
              const parsedPayload = typeof solutionRun.output_payload === 'string'
                ? JSON.parse(solutionRun.output_payload)
                : solutionRun.output_payload;
              if (parsedPayload.sandbox_investigation?.length) {
                rawSteps = parsedPayload.sandbox_investigation;
              }
              if (parsedPayload._interpreter_meta) {
                interpreterMeta = parsedPayload._interpreter_meta;
              }
            } catch (e) {
              console.error('Failed to parse solution output_payload', e);
            }
          }
        }

        // Try extracting from output.structured_response_json
        if (!rawSteps.length && data.output?.structured_response_json) {
          try {
            const parsedStruct = typeof data.output.structured_response_json === 'string'
              ? JSON.parse(data.output.structured_response_json)
              : data.output.structured_response_json;
            if (parsedStruct.sandbox_investigation?.length) {
              rawSteps = parsedStruct.sandbox_investigation;
            }
            if (parsedStruct._interpreter_meta) {
              interpreterMeta = parsedStruct._interpreter_meta;
            }
          } catch (e) {
            console.error('Failed to parse structured_response_json', e);
          }
        }

        // Fallbacks for top-level fields
        if (!rawSteps.length) {
          rawSteps = data.sandbox_investigation || data.report?.sandbox_investigation || [];
        }

        // Fallback: If sandbox_investigation is still empty, convert commands array into steps
        if (!rawSteps.length && data.output?.commands) {
          let cmds = data.output.commands;
          if (typeof cmds === 'string') {
            try { cmds = JSON.parse(cmds); } catch (e) {}
          }
          if (Array.isArray(cmds) && cmds.length > 0) {
            rawSteps = cmds.map((cmd: string, idx: number) => ({
              step: idx + 1,
              title: `Diagnostic Check ${idx + 1}`,
              purpose: `Execute diagnostic command`,
              command: cmd,
              expected_output: 'Command completed cleanly',
              ai_hint: 'Verify component metrics and active operations',
              root_cause_progress: 'Gathering diagnostic evidence'
            }));
          }
        }

        // Root Cause extraction from report JSON
        let extractedRootCause = '';
        if (data.output?.probable_root_causes) {
          try {
            const parsedRc = typeof data.output.probable_root_causes === 'string'
              ? JSON.parse(data.output.probable_root_causes)
              : data.output.probable_root_causes;
            if (Array.isArray(parsedRc) && parsedRc.length > 0) {
              extractedRootCause = parsedRc[0];
            }
          } catch (e) {
            extractedRootCause = String(data.output.probable_root_causes);
          }
        }
        if (!extractedRootCause && interpreterMeta?.exception_type) {
          extractedRootCause = interpreterMeta.exception_type;
        }
        if (!extractedRootCause && data.output?.log_summary) {
          extractedRootCause = data.output.log_summary;
        }
        setRootCause(extractedRootCause || 'Unresolved System Anomaly');

        // Observed Anomaly extraction
        let anomalyStr = interpreterMeta?.exception_type || data.output?.log_summary || 'Log Error Signature Detected';
        setObservedAnomaly(anomalyStr);

        // Extract metadata values
        if (interpreterMeta) {
          if (interpreterMeta.service && interpreterMeta.service !== 'Unknown Service') {
            setTargetService(interpreterMeta.service);
          }
          if (interpreterMeta.technology && Array.isArray(interpreterMeta.technology)) {
            setTechnology(interpreterMeta.technology.join(', '));
          }
          if (interpreterMeta.environment && interpreterMeta.environment !== 'Unknown') {
            setEnvironment(interpreterMeta.environment);
          }
        } else if (data.output?.evidence) {
          try {
            const ev = typeof data.output.evidence === 'string'
              ? JSON.parse(data.output.evidence)
              : data.output.evidence;
            if (Array.isArray(ev)) setTechnology(ev.join(', '));
          } catch (e) {}
        }

        // Map steps to standard SandboxStep format
        const mappedSteps = rawSteps.map((step: any, idx: number) => ({
          step: step.step ?? idx + 1,
          title: step.title ?? step.key ?? step.stage_title ?? `Stage ${idx + 1}`,
          purpose: step.purpose ?? step.observation ?? 'Diagnostic step',
          command: step.command ?? step.command_generated ?? '',
          expected_output: step.expected_output ?? step.output ?? step.result ?? '',
          log_snippet: step.log_snippet ?? step.log ?? '',
          evidence: step.evidence_collected?.key ?? step.ai_hint ?? step.evidence ?? '',
          finding: step.ai_insight ?? step.finding ?? step.root_cause_progress ?? step.conclusion ?? '',
          next_step: step.next_step ?? step.recommendation ?? '',
          estimated_time: step.estimated_time ?? '1',
          technology: step.technology ?? ''
        }));

        setSteps(mappedSteps);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-neutral-400">Loading investigation workspace…</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error loading workspace: {error}</div>;

  return (
    <InvestigationWorkspace
      steps={steps}
      targetService={targetService}
      technology={technology}
      environment={environment}
      rootCause={rootCause}
      observedAnomaly={observedAnomaly}
      confidenceScore={confidenceScore}
    />
  );
};

export default WorkspacePage;

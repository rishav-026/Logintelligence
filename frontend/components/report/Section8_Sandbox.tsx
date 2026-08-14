import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Loader2, ArrowRight } from 'lucide-react';

// Props: steps array adhering to sandbox_investigation contract
interface SandboxStep {
  step: number;
  title: string;
  purpose: string;
  command: string;
  expected_output: string;
  log_snippet?: string;
  evidence: string;
  finding: string;
  next_step: string;
  estimated_time: string;
  technology?: string;
}

interface Section8SandboxProps {
  steps: SandboxStep[];
}

const Section8_Sandbox: React.FC<Section8SandboxProps> = React.memo(({ steps }) => {
  // Hide component if no steps
  if (!steps || steps.length === 0) return null;

  const totalSteps = steps.length;

  // Compute total estimated time (minutes)
  const totalEstimated = steps.reduce((a, s) => {
    const t = parseInt(s.estimated_time);
    return a + (isNaN(t) ? 0 : t);
  }, 0);

  // State tracking
  const [currentIdx, setCurrentIdx] = useState<number>(0); // index of step being investigated
  const [statusMap, setStatusMap] = useState<Record<number, 'pending' | 'running' | 'completed'>>({});
  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showLogIdx, setShowLogIdx] = useState<number | null>(null);

  // Initialize all steps as pending
  useEffect(() => {
    const init: Record<number, 'pending' | 'running' | 'completed'> = {};
    steps.forEach((_, i) => (init[i] = 'pending'));
    setStatusMap(init);
    setExpandedStep(0);
  }, [steps]);

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  };

  const handleRun = (idx: number) => {
    // Only allow running the current step
    if (idx !== currentIdx) return;
    setStatusMap((prev) => ({ ...prev, [idx]: 'running' }));
    // Simulate deterministic loading then complete
    setTimeout(() => {
      setStatusMap((prev) => ({ ...prev, [idx]: 'completed' }));
    }, 800); // spinner duration
  };

  const handleContinue = (idx: number) => {
    if (idx !== currentIdx) return;
    const nextIdx = idx + 1;
    if (nextIdx < totalSteps) {
      setCurrentIdx(nextIdx);
      setExpandedStep(nextIdx);
    }
  };

  const completedCount = Object.values(statusMap).filter((s) => s === 'completed').length;
  const remainingTime = steps
    .slice(currentIdx)
    .reduce((a, s) => a + (parseInt(s.estimated_time) || 0), 0);

  const technology = steps.find((s) => s.technology)?.technology || 'N/A';
  const currentStage = steps[currentIdx]?.title || 'N/A';

  // Progress bar block style
  const progressBlocks = Math.round((completedCount / totalSteps) * 10);
  const progressBar = '█'.repeat(progressBlocks) + '░'.repeat(10 - progressBlocks);

  // Styling constants per spec
  const cardStyle = "rounded-[18px] p-6 gap-5 shadow-[0_12px_40px_rgba(0,0,0,.35)] border border-[rgba(255,255,255,.06)] bg-[#101828] hover:translate-y-[-2px] transition-all duration-180";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-cyan-400">Interactive Investigation</h2>
        <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
          <span>Technology: {technology}</span>
          <span>Investigation Progress: {completedCount} / {totalSteps}</span>
          <span>Estimated Remaining: {remainingTime} min</span>
          <span>Current Stage: {currentStage}</span>
        </div>
        <div className="font-mono text-sm text-neutral-500">{progressBar} Completed {completedCount} / {totalSteps} Steps ({Math.round((completedCount / totalSteps) * 100)}%)</div>
      </div>

      {/* Steps */}
      <div className="grid gap-4">
        {steps.map((step, idx) => {
          const status = statusMap[idx] || 'pending';
          const isCurrent = idx === currentIdx;
          const isExpanded = expandedStep === idx;
          return (
            <div
              key={idx}
              className={cardStyle + (isCurrent ? ' ring-2 ring-cyan-500' : '')}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? -1 : idx)}
              >
                <span className="text-sm font-medium text-cyan-300">
                  Step {idx + 1}: {step.title || 'Untitled'}
                </span>
                <span className={`text-xs font-semibold ${status === 'completed' ? 'text-emerald-400' : status === 'running' ? 'text-yellow-400' : 'text-neutral-500'}`}>
                  {status === 'completed' ? 'Completed' : status === 'running' ? 'Running' : 'Pending'}
                </span>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 space-y-5">
                  {/* Purpose */}
                  {step.purpose && (
                    <p className="text-sm text-neutral-300">
                      <strong>Purpose:</strong> {step.purpose}
                    </p>
                  )}

                  {/* Command */}
                  {step.command && (
                    <div className="bg-neutral-900/60 border border-white/5 rounded-md p-3 flex items-start gap-2">
                      <Terminal className="h-4 w-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                      <code className="text-sm font-mono text-cyan-300 break-all flex-1">{step.command}</code>
                      <button
                        onClick={() => handleCopy(step.command, idx)}
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors border border-[#334155] bg-transparent px-2 py-1 rounded"
                        title="Copy Command"
                      >
                        {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {copiedIdx === idx ? 'Copied' : 'Copy Command'}
                      </button>
                    </div>
                  )}

                  {/* Log Snippet */}
                  {step.log_snippet && (
                    <div className="mt-2">
                      <button
                        onClick={() => setShowLogIdx(showLogIdx === idx ? null : idx)}
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        Log Snippet {showLogIdx === idx ? '▼ Collapse' : '▶ Expand'}
                      </button>
                      {showLogIdx === idx && (
                        <pre className="mt-1 bg-[#020617] p-3 rounded text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                          {step.log_snippet}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleRun(idx)}
                      disabled={status !== 'pending' || !isCurrent}
                      className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${status !== 'pending' || !isCurrent ? 'bg-purple-500/20 text-purple-300 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'}`}
                    >
                      {status === 'running' ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="animate-spin h-3 w-3" /> Running
                        </span>
                      ) : (
                        'Run Investigation'
                      )}
                    </button>
                    {status === 'completed' && (
                      <button
                        onClick={() => handleContinue(idx)}
                        className="px-3 py-1 text-xs font-medium bg-[#16A34A] hover:bg-[#15803D] text-white rounded"
                      >
                        Continue Investigation →
                      </button>
                    )}
                  </div>

                  {/* Deterministic Results – shown after completed */}
                  {status === 'completed' && (
                    <div className="space-y-4">
                      {step.expected_output && (
                        <div>
                          <p className="text-xs font-medium text-neutral-400 mb-1">Expected Output</p>
                          <pre className="bg-[#020617] p-3 rounded text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                            {step.expected_output}
                          </pre>
                        </div>
                      )}
                      {step.evidence && (
                        <div>
                          <p className="text-xs font-medium text-neutral-400 mb-1">Evidence Collected</p>
                          <p className="text-sm text-neutral-300">{step.evidence}</p>
                        </div>
                      )}
                      {step.finding && (
                        <div>
                          <p className="text-xs font-medium text-neutral-400 mb-1">Finding</p>
                          <p className="text-sm text-neutral-300">{step.finding}</p>
                        </div>
                      )}
                      {step.next_step && (
                        <div>
                          <p className="text-xs font-medium text-neutral-400 mb-1">Recommended Next Step</p>
                          <p className="text-sm text-neutral-300">{step.next_step}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Screen */}
      {completedCount === totalSteps && (
        <div className="mt-8 p-6 bg-[#101828] rounded-[18px] shadow-[0_12px_40px_rgba(0,0,0,.35)] border border-[rgba(255,255,255,.06)] text-center">
          <h3 className="text-2xl font-bold text-emerald-400 flex items-center justify-center gap-2">
            <Check className="h-6 w-6" /> Investigation Complete
          </h3>
          <p className="mt-3 text-neutral-300">Root Cause Confirmed: {steps[steps.length - 1]?.finding || 'N/A'}</p>
          <p className="mt-1 text-neutral-300">Confidence: 98%</p>
          <p className="mt-2 text-neutral-300">Recovery Procedure Available</p>
          <p className="mt-1 text-neutral-300">Verification Passed</p>
        </div>
      )}
    </div>
  );
});

Section8_Sandbox.displayName = 'Section8_Sandbox';
export default Section8_Sandbox;

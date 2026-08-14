import React from 'react';
import { AlertTriangle, CheckCircle2, Shield, Clock } from 'lucide-react';

const Section1_IncidentOverview = React.memo(({ data, report, metadata }: { data: any, report: any, metadata?: any }) => {
  if (!data) return null;

  const severity = data.severity || 'Medium';
  
  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return 'badge-medium';
    }
  };

  const status = data.status === 'completed' ? 'DEGRADED' : 'INVESTIGATING';
  
  const interpreterMeta = metadata && Object.keys(metadata).length > 0 ? metadata : (() => {
    try {
      const runs = data.agent_runs || [];
      const interpreterRun = runs.find((r: any) => r.agent_name === 'Interpreter');
      if (interpreterRun) {
        let meta: any = {};
        if (interpreterRun.output_payload) {
          try { meta = JSON.parse(interpreterRun.output_payload); } catch {}
        }
        if ((!meta.service || !meta.environment) && interpreterRun.input_payload) {
            const input = interpreterRun.input_payload;
            const serviceMatch = input.match(/Service:\s*(.+)/);
            if (serviceMatch) meta.service = serviceMatch[1].trim();
            const envMatch = input.match(/Environment:\s*(.+)/);
            if (envMatch) meta.environment = envMatch[1].trim();
        }
        return meta;
      }
    } catch { return {}; }
    return {};
  })();

  const service = data.affected_service || interpreterMeta.service || 'payment-service';
  const environment = interpreterMeta.environment || 'Production';
  
  const getTechnology = () => {
    if (interpreterMeta.technology && Array.isArray(interpreterMeta.technology) && interpreterMeta.technology.length > 0) {
      const unique = [...new Set(interpreterMeta.technology)];
      return unique.slice(0, 3).join(' + ') + (unique.length > 3 ? '...' : '');
    }
    return interpreterMeta.framework || interpreterMeta.cache || interpreterMeta.database || 'Linux';
  };
  const technology = getTechnology();
  const getRootCauseText = () => {
    if (report?.root_cause_analysis?.primary_root_cause) {
      return report.root_cause_analysis.primary_root_cause;
    }
    
    if (report?.root_cause_analysis?.possible_causes?.[0]?.cause) {
      const causeStr = report.root_cause_analysis.possible_causes[0].cause;
      if (causeStr && causeStr !== 'Unknown Cause') return causeStr;
    }

    const rc = report?.root_cause || report?.probable_root_causes;
    if (Array.isArray(rc) && rc.length > 0 && rc[0] && rc[0] !== 'Unknown Cause') {
      return rc[0];
    }
    if (typeof rc === 'string' && rc !== 'Unknown Cause') {
      return rc;
    }

    if (interpreterMeta?.exception_type) {
      const err = interpreterMeta.error_codes?.[0] ? ` (${interpreterMeta.error_codes[0]})` : '';
      return `${interpreterMeta.exception_type}${err} on ${service}`;
    }

    if (interpreterMeta?.error_codes?.length > 0) {
      return `${interpreterMeta.error_codes.join(', ')} on ${service}`;
    }

    if (report?.executive_summary || report?.issue_summary) {
      const s = report.executive_summary || report.issue_summary;
      if (s && s.trim()) return s;
    }

    return `System Anomaly in ${service}`;
  };

  const rootCause = getRootCauseText();

  return (
    <div className="enterprise-card rounded-[18px] bg-[#0f172a] border border-[#1e293b] p-6 shadow-sm min-h-[220px] flex flex-col justify-between">
      {/* Top Bar: Title + Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[#94a3b8]" />
          <div>
            <h1 className="text-xl font-bold text-[#f8fafc] tracking-tight">Production Incident Report</h1>
            <p className="text-[12px] font-medium text-[#64748b]">INCIDENT ID: #{data.id || 'INC-001'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(severity)}`}>
            {severity} Severity
          </span>
          <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${status === 'DEGRADED' ? 'badge-high' : 'badge-low'}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-4">
        <div>
          <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider mb-1">Service</p>
          <p className="text-[14px] font-semibold text-[#f8fafc] truncate">{service}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider mb-1">Environment</p>
          <p className="text-[14px] font-semibold text-[#f8fafc]">{environment}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider mb-1">Technology</p>
          <p className="text-[14px] font-semibold text-[#f8fafc] truncate">{technology}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider mb-1">Assessment Confidence</p>
          <p className="text-[14px] font-bold text-[#38bdf8]">{data.confidence_score || 98}%</p>
        </div>
        <div className="col-span-2">
          <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider mb-1">Primary Finding</p>
          <p className="text-[13px] font-semibold text-[#fdba74] truncate">{rootCause}</p>
        </div>
      </div>
    </div>
  );
});

Section1_IncidentOverview.displayName = 'Section1_IncidentOverview';
export default Section1_IncidentOverview;

import React from 'react';

const Section5_EvidenceBoard = React.memo(({ metadata }: { metadata: any }) => {
  if (!metadata || Object.keys(metadata).length === 0) return null;

  // Grouping logic based on strict data integrity.
  const infraKeys = ['environment', 'cluster', 'namespace', 'container_platform', 'orchestrator', 'node', 'hostname'];
  const appKeys = ['service', 'component', 'technology', 'framework', 'runtime', 'database', 'cache', 'message_broker', 'web_server'];
  const incidentKeys = ['exception_type', 'error_codes', 'severity', 'restart_count'];
  const metricKeys = ['cpu_usage', 'memory_usage', 'disk_usage', 'latency', 'port_numbers', 'http_status'];

  const getGroup = (keys: string[]) => {
    return keys.filter(k => metadata[k] && (Array.isArray(metadata[k]) ? metadata[k].length > 0 : metadata[k] !== '')).map(k => ({
      key: k.replace('_', ' '),
      value: Array.isArray(metadata[k]) ? [...new Set(metadata[k])].join(', ') : metadata[k]
    }));
  };

  const infra = getGroup(infraKeys);
  const app = getGroup(appKeys);
  const incident = getGroup(incidentKeys);
  const metrics = getGroup(metricKeys);

  const renderGroup = (title: string, data: any[]) => {
    if (data.length === 0) return null;
    return (
      <div className="glass-card p-5 border border-white/5">
        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-4">{title}</h4>
        <div className="grid grid-cols-2 gap-4">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{item.key}</span>
              <p className="text-xs font-semibold text-neutral-300 break-words">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (infra.length === 0 && app.length === 0 && incident.length === 0 && metrics.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Evidence Board</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {renderGroup('Infrastructure', infra)}
        {renderGroup('Application Stack', app)}
        {renderGroup('Incident Signatures', incident)}
        {renderGroup('Metrics', metrics)}
      </div>
    </div>
  );
});

Section5_EvidenceBoard.displayName = 'Section5_EvidenceBoard';
export default Section5_EvidenceBoard;

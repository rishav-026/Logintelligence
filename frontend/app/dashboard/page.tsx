'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Activity, AlertTriangle, Clock, Percent, ShieldCheck, 
  Terminal, ArrowRight, Server, Calendar 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 1. Math calculations
  const totalIncidents = analyses.length;
  const criticalIncidents = analyses.filter(item => item.severity === 'Critical').length;
  
  const completedReports = analyses.filter(item => item.status === 'completed');
  
  const avgConfidence = completedReports.length > 0
    ? Math.round(completedReports.reduce((sum, item) => sum + (item.confidence_score || 0), 0) / completedReports.length)
    : 0;

  const avgAnalysisTime = completedReports.length > 0
    ? parseFloat((completedReports.reduce((sum, item) => sum + (item.execution_time_seconds || 0), 0) / completedReports.length).toFixed(1))
    : 0;

  // 2. Format Data for AreaChart (Incident volume over time)
  // Group by date
  const dateMap: { [key: string]: number } = {};
  analyses.slice().reverse().forEach(item => {
    const dateStr = new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
  });
  const chartData = Object.keys(dateMap).map(key => ({
    date: key,
    Incidents: dateMap[key]
  }));

  // 3. Format Data for PieChart (Severity Distribution)
  const severityMap: { [key: string]: number } = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  analyses.forEach(item => {
    const sev = item.severity || 'Medium';
    if (severityMap[sev] !== undefined) {
      severityMap[sev]++;
    } else {
      severityMap['Medium']++;
    }
  });
  const severityData = Object.keys(severityMap)
    .map(key => ({ name: key, value: severityMap[key] }))
    .filter(item => item.value > 0);

  const COLORS = {
    Critical: '#f43f5e',
    High: '#fb7185',
    Medium: '#fbbf24',
    Low: '#34d399'
  };

  // 4. Format Data for BarChart (Framework distribution)
  const frameworkMap: { [key: string]: number } = {};
  analyses.forEach(item => {
    // If output is completed, framework might be set or we default
    const fmw = item.affected_component?.includes('UserService') || item.title?.includes('Spring') ? 'Spring Boot' : 
                item.raw_log_text?.includes('fastapi') ? 'FastAPI' : 'General Node/Python';
    frameworkMap[fmw] = (frameworkMap[fmw] || 0) + 1;
  });
  const frameworkData = Object.keys(frameworkMap).map(key => ({
    name: key,
    Count: frameworkMap[key]
  }));

  // 5. Recent Reports List (top 5)
  const recentIncidents = analyses.slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Activity className="h-8 w-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-semibold text-neutral-400 animate-pulse">Aggregating system SRE telemetry metrics...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">SaaS Performance <span className="text-gradient-cyan">Dashboard</span></h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Real-time telemetry, agent metrics, and pipeline distribution logs.</p>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-2 bg-neutral-900 border border-white/5 hover:border-cyan-500/30 text-white font-bold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all hover:bg-neutral-950"
        >
          ⚡ Analyze New Log
        </Link>
      </div>

      {totalIncidents === 0 ? (
        /* Empty State */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center p-12 glass-card border border-white/5 min-h-[40vh]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/5 border border-cyan-500/10 mb-6 text-cyan-400 glow-cyan">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-neutral-200">No Incidents Analyzed Yet</h3>
          <p className="text-sm text-neutral-500 max-w-sm mt-2 font-medium">
            Deploy your agents on application logs or stack traces to synthesize SRE incident telemetry here.
          </p>
          <Link 
            href="/" 
            className="flex items-center gap-2 mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-xs tracking-wide uppercase px-6 py-3 rounded-xl hover:opacity-95 shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
          >
            Upload Production Log
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      ) : (
        /* Metrics dashboard content */
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5 hover:-translate-y-1 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Total Runs</span>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-cyan-400">
                  <Terminal className="h-4.5 w-4.5" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">{totalIncidents}</h2>
              <p className="text-[11px] font-semibold text-neutral-500">Total logs analyzed</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5 hover:-translate-y-1 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Critical Failures</span>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-rose-400">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">{criticalIncidents}</h2>
              <p className="text-[11px] font-semibold text-neutral-500">Requires SRE review</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5 hover:-translate-y-1 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Avg Confidence</span>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-emerald-400">
                  <Percent className="h-4.5 w-4.5" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">{avgConfidence}%</h2>
              <p className="text-[11px] font-semibold text-neutral-500">Weighted average rating</p>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5 hover:-translate-y-1 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Analysis Speed</span>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-amber-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">{avgAnalysisTime}s</h2>
              <p className="text-[11px] font-semibold text-neutral-500">Average local execution time</p>
            </motion.div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart - Log Incidents Trend */}
            <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 border border-white/5 flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Incident Volume Trends</h3>
                <p className="text-xs text-neutral-500">Pipeline runs logged over date ranges</p>
              </div>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="Incidents" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorIncidents)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-500">Waiting for data trends...</div>
                )}
              </div>
            </motion.div>

            {/* Donut Chart - Severity distribution */}
            <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Severity Distribution</h3>
                <p className="text-xs text-neutral-500">Breakdown of reported incident alerts</p>
              </div>
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-extrabold text-white">{totalIncidents}</span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Logs</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-xs font-semibold">
                {severityData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] }} />
                    <span className="text-neutral-400">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Lower Grid: Recent incidents list */}
          <motion.div variants={itemVariants} className="glass-card p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Recent Diagnostic Runs</h3>
                <p className="text-xs text-neutral-500">The latest multi-agent diagnostics audit logs</p>
              </div>
              <Link href="/history" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                View audit trail
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-neutral-400 border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    <th className="pb-3 pr-4">Incident Log</th>
                    <th className="pb-3 px-4">Severity</th>
                    <th className="pb-3 px-4">Service</th>
                    <th className="pb-3 px-4">Confidence</th>
                    <th className="pb-3 px-4">Created</th>
                    <th className="pb-3 pl-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentIncidents.map((item) => {
                    const sev = item.severity || 'Medium';
                    const badgeClass = 
                      sev === 'Critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      sev === 'High' ? 'bg-rose-400/10 border-rose-400/20 text-rose-300' :
                      sev === 'Low' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                       'bg-amber-500/10 border-amber-500/20 text-amber-400';

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 pr-4 font-bold text-neutral-200">
                          {item.title || `Incident Analysis #${item.id}`}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                            {sev}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-neutral-300">
                          {item.affected_service || 'Unknown'}
                        </td>
                        <td className="py-4 px-4 font-bold text-neutral-300">
                          {item.confidence_score}%
                        </td>
                        <td className="py-4 px-4 text-neutral-500 font-medium">
                          {new Date(item.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <Link 
                            href={`/analyses/${item.id}`}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-cyan-500/5 hover:border-cyan-500/20 text-neutral-400 hover:text-cyan-400 transition-all"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </motion.div>
          
        </motion.div>
      )}

    </div>
  );
}

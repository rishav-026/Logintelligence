'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  History, Search, Trash2, RefreshCw, ChevronRight, 
  Calendar, Clock, Server, Activity, Percent 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryTimelinePage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (err) {
      console.error("Failed to load history list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete SRE report #${id}?`)) return;

    setActionId(id);
    try {
      const res = await fetch(`${API_BASE}/api/report/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnalyses(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      alert("Failed to delete report: " + err);
    } finally {
      setActionId(null);
    }
  };

  const handleReanalyze = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Re-run diagnostics AI agents loop for report #${id}?`)) return;

    setActionId(id);
    try {
      const res = await fetch(`${API_BASE}/api/reanalyze/${id}`, { method: 'POST' });
      if (res.ok) {
        await fetchHistory();
      }
    } catch (err) {
      alert("Failed to trigger re-analysis: " + err);
    } finally {
      setActionId(null);
    }
  };

  const filteredAnalyses = analyses.filter(item => 
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.severity || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.affected_service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.affected_component || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="page-heading tracking-tight text-white">Diagnostic <span className="text-gradient-blue">Timeline</span></h1>
          <p className="caption-text text-slate-400 font-semibold">Audit trail tracking agent runs, exception classifications, and incident histories.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter timeline records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-white/5 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500/40 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Activity className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-400 animate-pulse">Loading diagnostic logs timeline...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 glass-card border border-white/5 min-h-[35vh]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 mb-4 text-slate-500">
            <History className="h-6 w-6" />
          </div>
          <h3 className="caption-text font-bold text-slate-300">Timeline Empty</h3>
          <p className="caption-text text-slate-500 max-w-xs mt-2 font-semibold">
            {searchQuery ? 'No records match your active query filters.' : 'Run diagnostics in your workspace to populate the SRE timeline.'}
          </p>
        </div>
      ) : (
        /* Vertical Chronological Timeline */
        <div className="relative pl-6 sm:pl-8 border-l border-white/5 space-y-8 ml-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredAnalyses.map((item) => {
                const sev = item.severity || 'Medium';
                const severityColor = 
                  sev === 'Critical' ? 'bg-red-500 glow-red' :
                  sev === 'High' ? 'bg-amber-500' :
                  sev === 'Low' ? 'bg-[#3B82F6]' : 'bg-emerald-500';

                const severityBadge = 
                  sev === 'Critical' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                  sev === 'High' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' :
                  sev === 'Low' ? 'bg-blue-500/10 border-blue-500/25 text-blue-400' : 
                                   'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';

                return (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    className="relative"
                  >
                    {/* Timeline Node marker dot */}
                    <span className={`absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 rounded-full border-4 border-[#0B1220] ${severityColor}`} />

                    {/* Timeline card */}
                    <div className="enterprise-card p-6 md:p-8 hover:border-blue-500/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                      
                      <div className="space-y-4 flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            #{item.id} SRE REPORT
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider ${severityBadge}`}>
                            {sev}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <Link href={`/report/${item.id}`}>
                          <h3 className="card-heading text-slate-200 group-hover:text-blue-400 transition-colors leading-snug md:text-xl">
                            {item.title || `Incident Diagnostic #${item.id}`}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap gap-5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          <span className="flex items-center gap-2">
                            <Server className="h-3.5 w-3.5 text-slate-500" />
                            Service: <span className="text-slate-200 font-bold">{item.affected_service || 'Unknown'}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <Percent className="h-3.5 w-3.5 text-slate-500" />
                            Confidence: <span className="text-slate-200 font-bold">{item.confidence_score}%</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            Duration: <span className="text-slate-200 font-bold">{item.execution_time_seconds || 0}s</span>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center w-full md:w-auto md:flex-col md:items-end gap-4 pt-4 md:pt-0 border-t border-white/5 md:border-none">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            disabled={actionId === item.id}
                            className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-slate-500 hover:text-red-400 transition-all disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => handleReanalyze(e, item.id)}
                            disabled={actionId === item.id || item.status === 'processing'}
                            className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 text-slate-500 hover:text-blue-400 transition-all disabled:opacity-40"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>

                        <Link 
                          href={`/report/${item.id}`}
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-blue-400 transition-colors"
                        >
                          View Report
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

    </div>
  );
}

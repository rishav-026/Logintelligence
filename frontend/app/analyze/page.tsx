'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Upload, Clipboard, FileText, Cpu, AlertTriangle, ShieldCheck, 
  Terminal, ArrowRight, Server, Database, Activity, RefreshCw,
  Clock, CheckCircle, ChevronRight, Pin 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyzeWorkspacePage() {
  const [logText, setLogText] = useState('');
  const [sourceType, setSourceType] = useState('paste');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  // History list state
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.slice(0, 8)); // Top 8 items
      }
    } catch (err) {
      console.error("Failed to load workspace history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!logText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_log_text: logText, source_type: sourceType })
      });
      const data = await res.json();
      if (data.id) router.push(`/report/${data.id}`);
    } catch (error) {
      alert("Failed to connect to backend service. Ensure API server is running on port 8000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const format = ext === 'json' ? 'json_file' : 'log_file';
    setSourceType(format);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogText(event.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const promptSuggestions = [
    { label: "PostgreSQL Pool Timeout", log: "ERROR: Connection pool exhausted. Timeout acquiring connection after 5000ms. active=100 max=100" },
    { label: "Java Heap OutOfMemory", log: "java.lang.OutOfMemoryError: Java heap space at com.service.OrderProcessor.process(OrderProcessor.java:142)" },
    { label: "Redis Connection Refused", log: "Error: ConnectionRefusedError [Errno 111] Connect call failed ('127.0.0.1', 6379)" },
    { label: "Kubernetes OOMKilled", log: "State: Terminated, Reason: OOMKilled, Exit Code: 137, Container: api-gateway" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* COLUMN 1-3: Main Diagnostic Input Form */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Workspace Title */}
        <div className="space-y-1">
          <h1 className="page-heading tracking-tight text-[#F8FAFC]">AI Diagnostics <span className="text-gradient-blue">Workspace</span></h1>
          <p className="caption-text text-[#94A3B8] font-semibold">Deploy autonomous local SRE agents to interpret runtime exceptions.</p>
        </div>

        {/* Diagnostic Input Card */}
        <div className="enterprise-card p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05)_0%,transparent_50%)] pointer-events-none" />
          
          {/* Format selection header */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-6 mb-6">
            <div className="flex bg-[#111827] p-1 rounded-xl border border-white/5">
              <button
                onClick={() => { setActiveTab('paste'); setUploadedFileName(null); }}
                className={`flex items-center gap-2 px-4.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'paste' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Clipboard className="h-3.5 w-3.5" />
                Paste Text
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'upload' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload File
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="caption-text font-bold text-[#94A3B8]">Type:</span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="bg-[#111827] border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500/40"
              >
                <option value="paste">Raw Text Paste</option>
                <option value="log_file">Log File (.log)</option>
                <option value="json_file">Structured JSON</option>
              </select>
            </div>
          </div>

          {/* Editor/Upload zone */}
          <AnimatePresence mode="wait">
            {activeTab === 'paste' ? (
              <motion.div
                key="paste"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <textarea
                  className="w-full min-h-[260px] bg-[#0B1220] border border-white/5 rounded-2xl p-5 text-xs md:text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-600 leading-relaxed"
                  placeholder="Paste execution trace logs or stack dump exceptions here..."
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`flex flex-col items-center justify-center min-h-[260px] border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-500/5' 
                    : 'border-white/10 hover:border-blue-500/35 bg-[#0B1220] hover:bg-[#111827]'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".txt,.log,.json"
                />
                
                <Upload className="h-7 w-7 text-slate-500 mb-4" />
                <h3 className="caption-text font-bold text-slate-200">
                  {uploadedFileName ? 'Selected' : 'Drag & drop log files here'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {uploadedFileName ? uploadedFileName : 'Supports .log, .txt, .json formats'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action triggers */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 gap-4 border-t border-white/5 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Suggestions:</span>
              {promptSuggestions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setLogText(item.log);
                    setActiveTab('paste');
                    setSourceType(item.label.includes("Java") ? "paste" : "log_file");
                  }}
                  className="text-[9px] font-bold text-slate-400 border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isSubmitting || !logText.trim()}
              className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs tracking-wider uppercase px-8 py-3.5 rounded-xl shadow-md shadow-blue-950/40 transition-all disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running AI Agents...
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  ⚡ Diagnose exception
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* COLUMN 4: Right Sidebar - System Telemetry */}
      <div className="flex flex-col gap-6">
        
        {/* Status card */}
        <div className="enterprise-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="h-4 w-4 text-blue-400" />
            <h3 className="caption-text font-bold uppercase tracking-wider">AI System Health</h3>
          </div>

          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-500 font-medium">Ollama Client:</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <CheckCircle className="h-4 w-4" />
                ONLINE
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-500 font-medium">Active Model:</span>
              <span className="text-slate-200 font-mono font-bold">llama3:latest</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-500 font-medium">Search tool:</span>
              <span className="text-cyan-400 font-bold">DuckDuckGo</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 font-medium">Agent framework:</span>
              <span className="text-slate-200 font-bold">CrewAI</span>
            </div>
          </div>
        </div>

        {/* Capabilities checklist */}
        <div className="enterprise-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Server className="h-4 w-4 text-cyan-400" />
            <h3 className="caption-text font-bold uppercase tracking-wider">Capable Engines</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Java Spring", "FastAPI ASGI", "Node Express", "Docker OOM", "K8s Crash", "SQL Database"].map((item) => (
              <span key={item} className="text-[10px] font-bold text-slate-400 border border-white/5 bg-[#111827] px-3 py-1.5 rounded-lg">{item}</span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

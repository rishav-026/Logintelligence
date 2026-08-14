'use client';

import { motion } from 'framer-motion';
import { 
  Terminal, Search, Cpu, FileText, History, Percent, 
  ShieldCheck, AlertTriangle 
} from 'lucide-react';

export default function FeaturesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const features = [
    {
      title: "AI Log Interpretation",
      desc: "Automatically extracts runtime metadata, detects logs syntax, stack trace snippets, and language parameters.",
      icon: Terminal,
      color: "text-cyan-400"
    },
    {
      title: "Root Cause Diagnostics",
      desc: "Heuristics and LLM SRE reasoning engine that isolates runtime exceptions and identifies primary system faults.",
      icon: AlertTriangle,
      color: "text-rose-400"
    },
    {
      title: "Multi-Agent Investigation",
      desc: "Interpreter, Researcher, and Synthesizer agents collaborate sequentially to resolve production anomalies.",
      icon: Cpu,
      color: "text-purple-400"
    },
    {
      title: "Live Web Search API",
      desc: "DuckDuckGo integration fetches community documentation fixes, GitHub threads, and StackOverflow answers.",
      icon: Search,
      color: "text-cyan-400"
    },
    {
      title: "SRE Incident Reports",
      desc: "Compiles operational summaries, code fixes, preventative metrics, and terminal execution commands.",
      icon: FileText,
      color: "text-emerald-400"
    },
    {
      title: "Local Offline AI",
      desc: "Powered by Ollama (llama3) locally to analyze logs securely, ensuring total operational logs privacy.",
      icon: ShieldCheck,
      color: "text-cyan-400"
    },
    {
      title: "Full Audit History",
      desc: "Maintains a SQLite-based chronological history of all incident runs and agent execution logs.",
      icon: History,
      color: "text-purple-400"
    },
    {
      title: "Confidence Score Meter",
      desc: "Custom SRE confidence calculations mapping analysis outputs to distinct severity warning rings.",
      icon: Percent,
      color: "text-amber-400"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-16 md:py-24 space-y-12 px-4 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="page-heading text-white">
          System <span className="text-gradient-cyan">Features</span>
        </h1>
        <p className="caption-text text-neutral-400 max-w-xl mx-auto font-semibold">
          A high-performance agentic AI workspace custom engineered for modern DevOps and SRE teams.
        </p>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8"
      >
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={i}
              variants={cardVariants}
              className="glass-card p-8 border border-white/5 flex flex-col justify-between min-h-[220px] hover:border-cyan-500/20 transition-all"
            >
              <div className="space-y-6">
                <div className={`p-3 rounded-2xl bg-white/[0.02] border border-white/8 w-fit ${feature.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="card-heading text-neutral-200">{feature.title}</h3>
                <p className="caption-text text-neutral-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}

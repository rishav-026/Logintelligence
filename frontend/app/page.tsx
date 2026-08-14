'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, ShieldCheck, Cpu, FileText, ArrowRight, 
  Activity, Lock, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const features = [
    { title: "Deterministic Heuristics Engine", desc: "Extracts log signatures, stack traces, metrics (CPU/RAM/latency), and infrastructure tags in milliseconds.", icon: Terminal, color: "text-blue-400" },
    { title: "Zero-Hallucination Playbooks", desc: "Operational commands and recovery runbooks are generated 100% deterministically by technology rule engines.", icon: ShieldCheck, color: "text-cyan-400" },
    { title: "Interactive SRE Workspace", desc: "Guides engineers step-by-stage through incident investigation with simulated shell output execution.", icon: Activity, color: "text-blue-400" },
    { title: "Comprehensive Post-Mortems", desc: "Synthesizes structured 14-section SRE reports with root cause analysis, evidence correlation, and code patches.", icon: FileText, color: "text-emerald-400" }
  ];

  const workflowSteps = [
    { title: "1. Ingest Log Text", desc: "Paste multi-line logs or upload file dumps (.log, .txt, .json)." },
    { title: "2. Regex Fact Extraction", desc: "Engine extracts stack traces, severity, metrics, and technology keywords." },
    { title: "3. Rule Engine Selection", desc: "Maps tech stack to pre-compiled playbooks (MongoDB, Redis, Kafka, K8s, etc.)." },
    { title: "4. LLM Narrative Synthesis", desc: "Local LLaMA3 agent writes executive descriptions without altering commands." },
    { title: "5. Interactive Runbook", desc: "Renders post-mortem report & step-by-step interactive SRE workspace." }
  ];

  const techIcons = ["Kubernetes", "Docker", "MongoDB", "Redis", "Kafka", "RabbitMQ", "NGINX", "PostgreSQL", "Spring Boot", "Python", "FastAPI", "Java"];

  const qualityGuarantees = [
    { title: "100% Command Safety", desc: "All diagnostic commands, sandbox steps, and recovery patches originate from hard-coded playbooks—never AI guesses.", icon: Lock },
    { title: "Sub-3-Second Pipeline", desc: "Regex parsing and playbook selection execute instantly before background agent synthesis.", icon: Zap },
    { title: "Complete Data Privacy", desc: "Zero external API calls required when using local Ollama model weights.", icon: ShieldCheck }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-24 py-12 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* 1. Hero Section */}
      <div className="relative text-center space-y-8 py-12 md:py-20">
        
        {/* Ambient background glow — enterprise blue */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-blue-500/[0.08] rounded-full blur-[130px] pointer-events-none -z-10" />

        {/* Hero badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/[0.08] px-4 py-1.5 text-xs font-semibold text-blue-400 shadow-lg shadow-blue-950/30"
        >
          <Cpu className="h-3.5 w-3.5 animate-pulse" />
          Enterprise DevOps Log Intelligence Platform v2.0
        </motion.div>

        {/* Hero title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F8FAFC] max-w-4xl mx-auto leading-tight"
        >
          Automated Incident Diagnostics &{' '}
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
            Deterministic SRE Runbooks
          </span>
        </motion.h1>

        {/* Hero subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Transform raw multi-line production logs into structured 14-section incident reports and interactive stage-by-stage investigation workspaces without AI command hallucinations.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
        >
          <Link
            href="/analyze"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg shadow-blue-950/40 transition-all hover:scale-[1.02]"
          >
            <Terminal className="h-4 w-4" />
            Analyze Production Log
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/history"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-800 bg-[#1E293B] hover:bg-[#263248] px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <Activity className="h-4 w-4 text-cyan-400" />
            View Incident History
          </Link>
        </motion.div>

      </div>

      {/* 2. Features Grid */}
      <div className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">Enterprise Platform Capabilities</h2>
          <p className="text-sm text-[#94A3B8] max-w-lg mx-auto">Engineered to eliminate MTTR latency during critical infrastructure Sev-1/Sev-2 outages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="rounded-2xl p-6 border border-slate-800 bg-[#1E293B] flex flex-col justify-between shadow-xl hover:border-slate-700 transition-colors">
                <div className="space-y-4">
                  <div className={`p-3 rounded-xl bg-[#111827] border border-slate-800 w-fit ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#F8FAFC]">{feature.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. How it Works (Workflow) */}
      <div className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">Diagnostic Execution Flow</h2>
          <p className="text-sm text-[#94A3B8] max-w-lg mx-auto">Deterministic parsing and technology playbooks coupled with local AI narrative synthesis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {workflowSteps.map((step, i) => (
            <div key={i} className="rounded-2xl p-5 border border-slate-800 bg-[#1E293B] flex flex-col justify-between shadow-lg hover:border-slate-700 transition-colors">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">{step.title}</span>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quality & Safety Guarantees */}
      <div className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">Architecture Standards</h2>
          <p className="text-sm text-[#94A3B8] max-w-lg mx-auto">Designed for enterprise SRE compliance and zero operational risk.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {qualityGuarantees.map((g, i) => {
            const Icon = g.icon;
            return (
              <div key={i} className="rounded-2xl p-6 border border-slate-800 bg-[#1E293B] space-y-3 shadow-xl hover:border-slate-700 transition-colors">
                <div className="p-2.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 text-blue-400 w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-[#F8FAFC]">{g.title}</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{g.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Supported Stacks Grid */}
      <div className="text-center space-y-6 pt-6 border-t border-slate-800/60">
        <h4 className="text-xs font-bold text-[#94A3B8] tracking-wider uppercase">
          Supported Technologies & Infrastructure Integration Rules
        </h4>
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {techIcons.map((tech) => (
            <span 
              key={tech}
              className="text-xs font-semibold text-slate-300 border border-slate-800 bg-[#1E293B] px-4 py-2 rounded-xl shadow-sm hover:border-slate-700 hover:text-white transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

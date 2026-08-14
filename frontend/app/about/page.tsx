'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Terminal, Users } from 'lucide-react';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const steps = [
    {
      title: "Our Mission",
      desc: "To democratize private, offline AI for DevOps teams. We believe system telemetry diagnostics shouldn't require sending sensitive operational logs to external cloud APIs.",
      icon: ShieldCheck,
      color: "text-cyan-400"
    },
    {
      title: "Agentic Engineering",
      desc: "By combining multi-agent sequential workflows with local model execution, we build SRE systems that reason, search, and document incidents locally and securely.",
      icon: Cpu,
      color: "text-purple-400"
    },
    {
      title: "Open Core Philosophy",
      desc: "We stand on the shoulders of giants. Our engine is built strictly on open-source technologies like LangChain, FastAPI, Next.js, and local weights via Ollama.",
      icon: Terminal,
      color: "text-cyan-400"
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto py-16 md:py-24 space-y-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Title */}
      <div className="text-center space-y-4">
        <h1 className="page-heading text-white">
          About <span className="text-gradient-cyan">LogIntelligence</span>
        </h1>
        <p className="caption-text text-neutral-400 max-w-xl mx-auto font-semibold">
          The developers behind local agentic log diagnostics and SRE incident response automation.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="glass-card p-8 border border-white/5 flex flex-col justify-between min-h-[240px]">
              <div className="space-y-6">
                <div className={`p-3 rounded-2xl bg-white/[0.02] border border-white/8 w-fit ${step.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="card-heading text-neutral-200">{step.title}</h3>
                <p className="caption-text text-neutral-400 font-medium leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Philosophy Callout */}
      <div className="glass-card p-8 md:p-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <h3 className="card-heading text-neutral-200 flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            Designed for Modern SREs
          </h3>
          <p className="caption-text text-neutral-400 max-w-2xl leading-relaxed font-semibold">
            LogIntelligence operates entirely on your localhost. You control your models, your log data, and your analysis loops.
          </p>
        </div>
      </div>

    </motion.div>
  );
}

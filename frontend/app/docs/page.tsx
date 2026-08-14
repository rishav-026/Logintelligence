'use client';

import { motion } from 'framer-motion';
import { Terminal, Code, Cpu, BookOpen, Layers } from 'lucide-react';

export default function DocsPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const codeBlocks = {
    ollama: "ollama pull llama3\nollama run llama3",
    backend: "cd backend\npython -m venv venv\n.\\venv\\Scripts\\Activate.ps1   # Windows\npip install -r requirements.txt\npip install -U ddgs\nuvicorn main:app --host 0.0.0.0 --port 8000 --reload",
    frontend: "cd frontend\nnpm install\nnpm run dev"
  };

  const apiEndpoints = [
    { method: "POST", route: "/api/analyze", desc: "Analyzes new logs. Ingests raw text or JSON file parameters." },
    { method: "GET", route: "/api/history", desc: "Retrieves the full database list of SRE reports and metrics." },
    { method: "GET", route: "/api/report/{id}", desc: "Fetches SRE synthesis and agent runs audit trails for a specific ID." },
    { method: "POST", route: "/api/reanalyze/{id}", desc: "Resets outputs and triggers re-analysis execution loop on existing log." },
    { method: "DELETE", route: "/api/report/{id}", desc: "Purges reports and associated database references." }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto py-16 md:py-24 space-y-16 px-4 sm:px-6 lg:px-8"
    >
      
      {/* Title */}
      <div className="space-y-4">
        <h1 className="page-heading text-white">Developer <span className="text-gradient-cyan">Documentation</span></h1>
        <p className="caption-text font-semibold text-neutral-500">Quick start guide, local LLM configurations, and REST API references.</p>
      </div>

      {/* Section 1: Ollama */}
      <div className="space-y-5">
        <h2 className="card-heading text-neutral-200 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-cyan-400" />
          1. Ollama Integration Setup
        </h2>
        <p className="caption-text text-neutral-400 leading-relaxed font-semibold">
          LogIntelligence queries a local Ollama server. Pull the `llama3` model to your local registry:
        </p>
        <div className="bg-neutral-950/80 border border-white/5 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-cyan-300 overflow-x-auto whitespace-pre">
          {codeBlocks.ollama}
        </div>
      </div>

      {/* Section 2: Backend */}
      <div className="space-y-5">
        <h2 className="card-heading text-neutral-200 flex items-center gap-2">
          <Terminal className="h-6 w-6 text-purple-400" />
          2. FastAPI Service Execution
        </h2>
        <p className="caption-text text-neutral-400 leading-relaxed font-semibold">
          Set up the Python environment, configure dependencies, database migrations, and launch the server:
        </p>
        <div className="bg-neutral-950/80 border border-white/5 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-purple-300 overflow-x-auto whitespace-pre">
          {codeBlocks.backend}
        </div>
      </div>

      {/* Section 3: Frontend */}
      <div className="space-y-5">
        <h2 className="card-heading text-neutral-200 flex items-center gap-2">
          <Layers className="h-6 w-6 text-cyan-400" />
          3. Next.js Dashboard Client
        </h2>
        <p className="caption-text text-neutral-400 leading-relaxed font-semibold">
          Launch the dashboard web client:
        </p>
        <div className="bg-neutral-950/80 border border-white/5 rounded-2xl p-5 font-mono text-[11px] leading-relaxed text-cyan-300 overflow-x-auto whitespace-pre">
          {codeBlocks.frontend}
        </div>
      </div>

      {/* Section 4: API References */}
      <div className="space-y-5 pt-4">
        <h2 className="card-heading text-neutral-200 flex items-center gap-2">
          <Code className="h-6 w-6 text-cyan-400" />
          4. REST API Endpoint Reference
        </h2>
        <div className="overflow-x-auto w-full border border-white/5 rounded-2xl bg-neutral-950/45">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                <th className="p-4.5">Method</th>
                <th className="p-4.5">Endpoint</th>
                <th className="p-4.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-400">
              {apiEndpoints.map((api, i) => (
                <tr key={i} className="hover:bg-white/[0.01]">
                  <td className="p-4.5 font-bold text-cyan-400">{api.method}</td>
                  <td className="p-4.5 font-mono text-neutral-200">{api.route}</td>
                  <td className="p-4.5 font-medium">{api.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}

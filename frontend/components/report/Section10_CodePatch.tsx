import React, { useState } from 'react';
import { Copy, Check, Download, Code } from 'lucide-react';

const Section10_CodePatch = React.memo(({ code }: { code: any }) => {
  if (!code) return null;
  const rawCode = typeof code === 'string' ? code : typeof code === 'object' ? JSON.stringify(code, null, 2) : String(code);
  if (!rawCode || rawCode.trim() === '') return null;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Proposed Code / Config Patch</h3>
      <div className="glass-card border border-white/5 overflow-hidden">
        <div className="flex justify-between items-center bg-neutral-900/80 px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2 text-neutral-500">
            <Code className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Patch</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="p-4 bg-[#0a0a0a] overflow-x-auto">
          <pre className="p-4 text-xs font-mono text-cyan-300 overflow-x-auto bg-black/40 leading-relaxed">
            {rawCode}
          </pre>
        </div>
      </div>
    </div>
  );
});

Section10_CodePatch.displayName = 'Section10_CodePatch';
export default Section10_CodePatch;

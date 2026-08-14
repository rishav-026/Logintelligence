'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, Shield, Mail, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/analyze');
  };

  return (
    <div className="mx-auto max-w-5xl min-h-[75vh] grid grid-cols-1 md:grid-cols-2 border border-white/5 bg-[#0b0f19]/40 backdrop-blur-md rounded-[32px] overflow-hidden shadow-2xl relative my-10">
      
      {/* Left side: Premium Branding Column */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-cyan-950/20 via-neutral-950 to-neutral-950 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.08)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.06)_0%,transparent_40%)] pointer-events-none" />
        
        <div className="relative flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Log<span className="text-gradient-cyan">Intelligence</span>
          </span>
        </div>

        <div className="relative space-y-4">
          <h2 className="card-heading text-white leading-tight font-bold">
            Deploy local agents on <br />
            your production crashes.
          </h2>
          <p className="caption-text text-neutral-400 font-semibold leading-relaxed max-w-sm">
            Access secure telemetry data, custom parameter models, and SRE audit checklists offline on your localhost.
          </p>
        </div>

        <div className="relative text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <Shield className="h-4.5 w-4.5 text-cyan-400" />
          Offline Logs Confidentiality
        </div>
      </div>

      {/* Right side: Login Card */}
      <div className="flex flex-col justify-center p-8 md:p-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          <div className="space-y-2">
            <h2 className="card-heading text-neutral-200">Welcome Back</h2>
            <p className="caption-text text-neutral-500 font-semibold">Enter your credentials to enter your diagnostics workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-950 border border-white/5 rounded-2xl text-xs font-bold text-neutral-200 focus:outline-none focus:border-cyan-500/30 shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
                <a href="#" className="text-[10px] font-bold text-cyan-400 hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-950 border border-white/5 rounded-2xl text-xs font-bold text-neutral-200 focus:outline-none focus:border-cyan-500/30 shadow-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-xs tracking-wider uppercase py-4 rounded-2xl hover:opacity-95 shadow-[0_4px_15px_rgba(6,182,212,0.2)] transition-all hover:scale-[1.01]"
            >
              Sign In to Dashboard
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          {/* Social Sign In Mock */}
          <div className="space-y-4 pt-2">
            <div className="relative flex justify-center text-xs uppercase font-bold text-neutral-600">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <span className="relative bg-[#050816] px-3 select-none">Or continue with</span>
            </div>
            <button
              onClick={() => router.push('/analyze')}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.01] py-3.5 text-xs font-bold text-neutral-300 hover:bg-white/[0.04] transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.48 0-6.3-2.82-6.3-6.3 0-3.48 2.82-6.3 6.3-6.3 1.625 0 3.01.59 4.094 1.57l3.193-3.193C19.266 2.43 16.02 1.2 12.24 1.2 6.21 1.2 1.2 6.21 1.2 12.24s5.01 11.04 11.04 11.04c6.3 0 10.47-4.425 10.47-10.635 0-.712-.06-1.395-.187-2.033H12.24z"/></svg>
              Google Identity Sandbox
            </button>
          </div>

          <div className="text-center text-xs text-neutral-500 font-semibold">
            Don't have an account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:underline">
              Create an account
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

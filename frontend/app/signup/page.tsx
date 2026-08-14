'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, User, Mail, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    router.push('/analyze');
  };

  return (
    <div className="mx-auto max-w-md glass-card border border-white/5 p-8 md:p-12 shadow-2xl relative my-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="space-y-8 relative">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="card-heading text-neutral-200">Create account</h2>
            <p className="caption-text text-neutral-500 mt-1 font-semibold">Join LogIntelligence for private, local SRE agent runs.</p>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Name input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-neutral-950 border border-white/5 rounded-2xl text-xs font-bold text-neutral-200 focus:outline-none focus:border-cyan-500/30 shadow-sm"
              />
            </div>
          </div>

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
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Password</label>
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

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-neutral-950 border border-white/5 rounded-2xl text-xs font-bold text-neutral-200 focus:outline-none focus:border-cyan-500/30 shadow-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-xs tracking-wider uppercase py-4 rounded-2xl hover:opacity-95 shadow-[0_4px_15px_rgba(6,182,212,0.2)] transition-all hover:scale-[1.01]"
          >
            Create SaaS Account
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-neutral-500 font-semibold pt-2">
          Already have an account?{' '}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Login here
          </Link>
        </div>

      </div>
    </div>
  );
}

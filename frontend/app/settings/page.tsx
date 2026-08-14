'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, Cpu, Search, Database, Bell, Save, 
  Check, Sliders, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [model, setModel] = useState('llama3');
  const [temperature, setTemperature] = useState(0.1);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [cacheQueries, setCacheQueries] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(60);
  const [isSaved, setIsSaved] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('sre_settings_model');
      const savedTemp = localStorage.getItem('sre_settings_temp');
      const savedWeb = localStorage.getItem('sre_settings_web');
      
      if (savedModel) setModel(savedModel);
      if (savedTemp) setTemperature(parseFloat(savedTemp));
      if (savedWeb) setEnableWebSearch(savedWeb === 'true');
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sre_settings_model', model);
      localStorage.setItem('sre_settings_temp', temperature.toString());
      localStorage.setItem('sre_settings_web', enableWebSearch.toString());
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto py-6"
    >
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System <span className="text-gradient-cyan">Settings</span></h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Configure SRE agents parameters, local LLMs, and webhook thresholds.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar (Visual mock) */}
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 text-left">
            <Sliders className="h-4.5 w-4.5" />
            General Parameters
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:text-neutral-300 text-left cursor-not-allowed">
            <Bell className="h-4.5 w-4.5" />
            Alerting Integrations
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:text-neutral-300 text-left cursor-not-allowed">
            <Database className="h-4.5 w-4.5" />
            Database Export
          </button>
        </div>

        {/* Configurations Box */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-white/5 space-y-6 shadow-xl">
            
            {/* Setting 1: Local Model Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-cyan-400" />
                Default Local LLM Model
              </label>
              <p className="text-xs text-neutral-500 font-medium">Select the default model downloaded in your local Ollama registry.</p>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-neutral-950/80 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-neutral-200 focus:outline-none focus:border-cyan-500/30 shadow-sm mt-1"
              >
                <option value="llama3">Llama 3 (Meta 8B) [Recommended]</option>
                <option value="llama3:latest">Llama 3 (Latest)</option>
                <option value="phi">Phi (Microsoft 2.7B)</option>
                <option value="mistral">Mistral (7B)</option>
              </select>
            </div>

            {/* Setting 2: Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  <Sliders className="h-4 w-4 text-purple-400" />
                  Agent Execution Temperature
                </label>
                <span className="text-xs font-bold text-purple-400">{temperature}</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">Lower values make the SRE diagnostics more deterministic; higher values increase text variety.</p>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Setting 3: Web Search Toggle */}
            <div className="flex justify-between items-center py-2">
              <div className="space-y-0.5">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  <Search className="h-4 w-4 text-cyan-400" />
                  Enable Online Documentation Search
                </label>
                <p className="text-[11px] text-neutral-500 font-medium">Allow the Solution Researcher to query DuckDuckGo for runtime crash logs solutions.</p>
              </div>
              <button 
                onClick={() => setEnableWebSearch(!enableWebSearch)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {enableWebSearch ? (
                  <ToggleRight className="h-8 w-8 text-cyan-400" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Setting 4: DB Cache Queries */}
            <div className="flex justify-between items-center py-2">
              <div className="space-y-0.5">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  <Database className="h-4 w-4 text-purple-400" />
                  Cache Analysis Results
                </label>
                <p className="text-[11px] text-neutral-500 font-medium">Enable caching to save analysis runs metrics and prevent redundant local Ollama querying.</p>
              </div>
              <button 
                onClick={() => setCacheQueries(!cacheQueries)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                {cacheQueries ? (
                  <ToggleRight className="h-8 w-8 text-cyan-400" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Setting 5: Alerting threshold */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  <Bell className="h-4 w-4 text-amber-400" />
                  Confidence Score Alert Threshold
                </label>
                <span className="text-xs font-bold text-amber-400">{alertThreshold}%</span>
              </div>
              <p className="text-xs text-neutral-500 font-medium">Triggers high-priority alerting signals if the synthesis confidence score drops below this limit.</p>
              <input
                type="range"
                min="30"
                max="90"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-xs tracking-wider uppercase px-6 py-3 rounded-xl hover:opacity-95 shadow-[0_4px_15px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all transform active:scale-95"
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Parameters Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Parameters
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
}

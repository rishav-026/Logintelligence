import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import './globals.css';
import '../styles/theme.css';
import '../styles/fonts.css';

export const metadata: Metadata = {
  title: 'DevOps Log Intelligence System',
  description: 'AI-powered log analysis and SRE incident diagnostics platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen bg-background text-foreground selection:bg-amber-500/20 selection:text-amber-300">
        <Navbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-neutral-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>&copy; {new Date().getFullYear()} LogIntelligence Platform. Powered by Local SRE AI Agents.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

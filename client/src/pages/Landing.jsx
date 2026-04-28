import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Animated background orbs */}
      <div className="fixed w-[500px] h-[500px] rounded-full bg-violet-primary blur-[80px] opacity-15 pointer-events-none -top-24 -right-24 animate-float z-0"></div>
      <div className="fixed w-[400px] h-[400px] rounded-full bg-violet-secondary blur-[80px] opacity-15 pointer-events-none -bottom-12 -left-24 animate-float-reverse z-0"></div>
      <div className="fixed w-[300px] h-[300px] rounded-full bg-sky-accent blur-[80px] opacity-15 pointer-events-none top-1/2 left-1/2 animate-float-delayed z-0"></div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-15 py-5 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">⚖️</span>
          <span className="text-xl font-bold gradient-text">Legal AI Analyzer</span>
        </div>
        <div className="flex gap-3 sm:gap-4 items-center">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:block px-5 py-2.5 rounded-lg border dark:border-white/15 border-slate-300 dark:text-slate-300 text-slate-600 no-underline font-medium text-[0.95rem] transition-all duration-300 hover:border-violet-primary/50 dark:hover:text-white hover:text-violet-600 hover:bg-violet-primary/[0.08]">
            Log In
          </Link>
          <Link to="/register" className="px-6 py-2.5 rounded-lg text-white no-underline font-semibold text-[0.95rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative z-5 text-center max-w-[850px] mx-auto pt-20 pb-15 px-10 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full dark:bg-violet-primary/10 bg-violet-primary/[0.05] border dark:border-violet-primary/25 border-violet-primary/20 text-violet-600 dark:text-violet-300 text-[0.85rem] font-medium mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-primary animate-pulse-dot"></span>
          Powered by Gemini AI + Pinecone Vector DB
        </div>
        <h1 className="text-4xl md:text-[3.5rem] font-extrabold leading-[1.15] dark:text-slate-100 text-slate-900 mb-6 tracking-tight">
          Understand Any Legal Document
          <span className="gradient-text-hero"> in Seconds</span>
        </h1>
        <p className="text-lg dark:text-slate-400 text-slate-600 leading-relaxed max-w-[700px] mx-auto mb-9">
          Upload your contracts, agreements, and legal PDFs. Our AI-powered RAG pipeline 
          analyzes every clause, identifies risks, and answers your questions with 
          pinpoint accuracy — backed by the actual document text.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register" className="px-8 py-3.5 rounded-lg text-white no-underline font-semibold text-[1.05rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            Start Analyzing Documents →
          </Link>
          <a href="#how-it-works" className="px-8 py-3.5 rounded-lg border dark:border-white/15 border-slate-300 dark:text-slate-300 text-slate-600 no-underline font-medium text-[1.05rem] transition-all duration-300 hover:border-violet-primary/50 dark:hover:text-white hover:text-violet-600 hover:bg-violet-primary/[0.08]">
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-10 mt-15 p-7 rounded-2xl dark:bg-white/[0.02] bg-black/[0.02] border dark:border-white/[0.06] border-slate-200">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold gradient-text-stat">3072</span>
            <span className="text-[0.85rem] text-slate-500 font-medium">Embedding Dimensions</span>
          </div>
          <div className="w-15 h-px md:w-px md:h-10 dark:bg-white/10 bg-slate-200"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold gradient-text-stat">&lt;3s</span>
            <span className="text-[0.85rem] text-slate-500 font-medium">Query Response Time</span>
          </div>
          <div className="w-15 h-px md:w-px md:h-10 dark:bg-white/10 bg-slate-200"></div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-extrabold gradient-text-stat">500+</span>
            <span className="text-[0.85rem] text-slate-500 font-medium">Words per Chunk</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`relative z-5 max-w-[1200px] mx-auto py-20 px-6 md:px-10 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <h2 className="text-center text-3xl md:text-4xl font-bold dark:text-slate-100 text-slate-900 mb-3">Why Legal AI Analyzer?</h2>
        <p className="text-center dark:text-slate-400 text-slate-600 text-lg mb-12">
          Built with a production-grade RAG architecture — not a toy wrapper around ChatGPT.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '📄', title: 'Smart PDF Processing', desc: 'Upload any legal PDF up to 10MB. Our parser extracts text with high fidelity, preserving document structure and legal terminology.' },
            { icon: '🧩', title: 'Intelligent Chunking', desc: 'Documents are split into 500-word chunks with 100-word overlap, ensuring no context is lost between sections — critical for legal analysis.' },
            { icon: '🧠', title: 'Vector Embeddings', desc: "Each chunk is embedded into 3072-dimensional vectors using Gemini's embedding model and stored in Pinecone for lightning-fast semantic search." },
            { icon: '🎯', title: 'Precise RAG Answers', desc: 'Questions are answered using ONLY the relevant document context — no hallucinations, no generic advice. Every answer is grounded in your document.' },
            { icon: '🚨', title: 'Risk Detection', desc: 'The AI automatically flags potential legal risks, obligations, and liabilities found in your documents with clear [RISK] tags.' },
            { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, user-scoped documents, and encrypted data transfer. Your legal documents stay yours.' },
          ].map((feature) => (
            <div key={feature.title} className="glass-panel p-8 transition-all duration-300 hover:-translate-y-1 hover:border-violet-primary/20 hover:shadow-[0_12px_40px_rgba(139,92,246,0.1)]">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold dark:text-slate-100 text-slate-800 mb-2.5">{feature.title}</h3>
              <p className="dark:text-slate-400 text-slate-600 text-[0.95rem] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-5 max-w-[800px] mx-auto py-20 px-6 md:px-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold dark:text-slate-100 text-slate-900 mb-3">How It Works</h2>
        <p className="text-center dark:text-slate-400 text-slate-600 text-lg mb-12">A production-grade RAG pipeline in 4 steps</p>

        <div className="flex flex-col">
          {[
            { num: '01', title: 'Upload Your PDF', desc: 'Drag & drop any legal document — contracts, NDAs, lease agreements, terms of service. The text is extracted in-memory using pdf-parse.' },
            { num: '02', title: 'AI Chunks & Embeds', desc: "The document is split into overlapping semantic chunks. Each chunk is converted into a 3072-dimensional vector using Gemini's embedding API." },
            { num: '03', title: 'Stored in Pinecone', desc: 'Vectors are upserted into a Pinecone index with document-level metadata, enabling filtered semantic search scoped to your specific document.' },
            { num: '04', title: 'Ask Questions & Get Answers', desc: 'Your question is embedded and matched against the top-5 most relevant chunks. Gemini generates a precise answer using only the matched context.' },
          ].map((step, idx) => (
            <div key={step.num}>
              <div className="flex gap-5 md:gap-7 items-start p-5 md:p-7 rounded-xl transition-all duration-300 hover:bg-white/[0.02]">
                <span className="text-4xl md:text-5xl font-extrabold gradient-text-step leading-none min-w-[50px] md:min-w-[60px]">{step.num}</span>
                <div>
                  <h3 className="text-xl font-semibold dark:text-slate-100 text-slate-800 mb-2">{step.title}</h3>
                  <p className="dark:text-slate-400 text-slate-600 text-[0.95rem] leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {idx < 3 && (
                <div className="w-0.5 h-6 ml-[38px] md:ml-[56px]" style={{ background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.05))' }}></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-5 max-w-[900px] mx-auto pt-15 pb-20 px-6 md:px-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold dark:text-slate-100 text-slate-900 mb-10">Built With</h2>
        <div className="flex flex-wrap gap-3.5 justify-center">
          {[
            { name: 'React', desc: 'Frontend UI', color: '#61dafb' },
            { name: 'Node.js', desc: 'Backend Runtime', color: '#68a063' },
            { name: 'Express', desc: 'REST API', color: '#f0db4f' },
            { name: 'MongoDB', desc: 'Database', color: '#4db33d' },
            { name: 'Pinecone', desc: 'Vector Store', color: '#00b4d8' },
            { name: 'Gemini AI', desc: 'LLM + Embeddings', color: '#8b5cf6' },
          ].map((tech) => (
            <div key={tech.name} className="flex items-center gap-3 px-5 py-3 rounded-full dark:bg-white/[0.03] bg-black/[0.03] border dark:border-white/[0.08] border-black/[0.05] transition-all duration-300 hover:border-violet-primary/20 hover:-translate-y-0.5 hover:bg-violet-primary/[0.05]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tech.color }}></span>
              <div>
                <span className="font-semibold dark:text-slate-200 text-slate-800 text-[0.95rem] mr-1.5">{tech.name}</span>
                <span className="dark:text-slate-500 text-slate-500 text-[0.85rem]">{tech.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-5 max-w-[800px] mx-auto px-6 md:px-10 pb-20">
        <div className="glass-panel text-center py-15 px-6 md:px-10" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <h2 className="text-2xl md:text-3xl font-bold dark:text-slate-100 text-slate-900 mb-3">Ready to Analyze Your First Document?</h2>
          <p className="dark:text-slate-400 text-slate-600 text-lg mb-7">Sign up for free and upload your first legal PDF in under 30 seconds.</p>
          <Link to="/register" className="inline-block px-8 py-3.5 rounded-lg text-white no-underline font-semibold text-[1.05rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-5 border-t dark:border-white/[0.05] border-slate-200 py-6 px-10">
        <div className="flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2.5 text-slate-600 text-[0.85rem]">
          <span>⚖️ Legal AI Analyzer</span>
          <span className="hidden md:inline">·</span>
          <span>Full-Stack RAG Application</span>
          <span className="hidden md:inline">·</span>
          <span>Built with MERN + Gemini + Pinecone</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    setIsVisible(true);
  }, []);

  return (
    <div className="landing-page">
      {/* Animated background orbs */}
      <div className="landing-orb landing-orb-1"></div>
      <div className="landing-orb landing-orb-2"></div>
      <div className="landing-orb landing-orb-3"></div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <span className="landing-logo-icon">⚖️</span>
          <span className="landing-logo-text">Legal AI Analyzer</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="landing-btn-ghost">Log In</Link>
          <Link to="/register" className="landing-btn-cta">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`landing-hero ${isVisible ? 'landing-fade-in' : ''}`}>
        <div className="landing-hero-badge">
          <span className="landing-badge-dot"></span>
          Powered by Gemini AI + Pinecone Vector DB
        </div>
        <h1 className="landing-hero-title">
          Understand Any Legal Document
          <span className="landing-hero-gradient"> in Seconds</span>
        </h1>
        <p className="landing-hero-subtitle">
          Upload your contracts, agreements, and legal PDFs. Our AI-powered RAG pipeline 
          analyzes every clause, identifies risks, and answers your questions with 
          pinpoint accuracy — backed by the actual document text.
        </p>
        <div className="landing-hero-actions">
          <Link to="/register" className="landing-btn-cta landing-btn-lg">
            Start Analyzing Documents →
          </Link>
          <a href="#how-it-works" className="landing-btn-ghost landing-btn-lg">
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="landing-stats">
          <div className="landing-stat">
            <span className="landing-stat-number">3072</span>
            <span className="landing-stat-label">Embedding Dimensions</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat">
            <span className="landing-stat-number">&lt;3s</span>
            <span className="landing-stat-label">Query Response Time</span>
          </div>
          <div className="landing-stat-divider"></div>
          <div className="landing-stat">
            <span className="landing-stat-number">500+</span>
            <span className="landing-stat-label">Words per Chunk</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`landing-features ${isVisible ? 'landing-slide-up' : ''}`}>
        <h2 className="landing-section-title">Why Legal AI Analyzer?</h2>
        <p className="landing-section-subtitle">
          Built with a production-grade RAG architecture — not a toy wrapper around ChatGPT.
        </p>

        <div className="landing-features-grid">
          <div className="landing-feature-card glass-panel">
            <div className="landing-feature-icon">📄</div>
            <h3>Smart PDF Processing</h3>
            <p>Upload any legal PDF up to 10MB. Our parser extracts text with high fidelity, preserving document structure and legal terminology.</p>
          </div>
          
          <div className="landing-feature-card glass-panel">
            <div className="landing-feature-icon">🧩</div>
            <h3>Intelligent Chunking</h3>
            <p>Documents are split into 500-word chunks with 100-word overlap, ensuring no context is lost between sections — critical for legal analysis.</p>
          </div>
          
          <div className="landing-feature-card glass-panel">
            <div className="landing-feature-icon">🧠</div>
            <h3>Vector Embeddings</h3>
            <p>Each chunk is embedded into 3072-dimensional vectors using Gemini's embedding model and stored in Pinecone for lightning-fast semantic search.</p>
          </div>
          
          <div className="landing-feature-card glass-panel">
            <div className="landing-feature-icon">🎯</div>
            <h3>Precise RAG Answers</h3>
            <p>Questions are answered using ONLY the relevant document context — no hallucinations, no generic advice. Every answer is grounded in your document.</p>
          </div>
          
          <div className="landing-feature-card glass-panel">
            <div className="landing-feature-icon">🚨</div>
            <h3>Risk Detection</h3>
            <p>The AI automatically flags potential legal risks, obligations, and liabilities found in your documents with clear [RISK] tags.</p>
          </div>
          
          <div className="landing-feature-card glass-panel">
            <div className="landing-feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>JWT authentication, user-scoped documents, and encrypted data transfer. Your legal documents stay yours.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-how-it-works">
        <h2 className="landing-section-title">How It Works</h2>
        <p className="landing-section-subtitle">A production-grade RAG pipeline in 4 steps</p>

        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-number">01</div>
            <div className="landing-step-content">
              <h3>Upload Your PDF</h3>
              <p>Drag & drop any legal document — contracts, NDAs, lease agreements, terms of service. The text is extracted in-memory using pdf-parse.</p>
            </div>
          </div>

          <div className="landing-step-connector"></div>

          <div className="landing-step">
            <div className="landing-step-number">02</div>
            <div className="landing-step-content">
              <h3>AI Chunks & Embeds</h3>
              <p>The document is split into overlapping semantic chunks. Each chunk is converted into a 3072-dimensional vector using Gemini's embedding API.</p>
            </div>
          </div>

          <div className="landing-step-connector"></div>

          <div className="landing-step">
            <div className="landing-step-number">03</div>
            <div className="landing-step-content">
              <h3>Stored in Pinecone</h3>
              <p>Vectors are upserted into a Pinecone index with document-level metadata, enabling filtered semantic search scoped to your specific document.</p>
            </div>
          </div>

          <div className="landing-step-connector"></div>

          <div className="landing-step">
            <div className="landing-step-number">04</div>
            <div className="landing-step-content">
              <h3>Ask Questions & Get Answers</h3>
              <p>Your question is embedded and matched against the top-5 most relevant chunks. Gemini generates a precise answer using only the matched context.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="landing-tech-stack">
        <h2 className="landing-section-title">Built With</h2>
        <div className="landing-tech-grid">
          {[
            { name: 'React', desc: 'Frontend UI', color: '#61dafb' },
            { name: 'Node.js', desc: 'Backend Runtime', color: '#68a063' },
            { name: 'Express', desc: 'REST API', color: '#f0db4f' },
            { name: 'MongoDB', desc: 'Database', color: '#4db33d' },
            { name: 'Pinecone', desc: 'Vector Store', color: '#00b4d8' },
            { name: 'Gemini AI', desc: 'LLM + Embeddings', color: '#8b5cf6' },
          ].map((tech) => (
            <div key={tech.name} className="landing-tech-pill">
              <span className="landing-tech-dot" style={{ backgroundColor: tech.color }}></span>
              <div>
                <span className="landing-tech-name">{tech.name}</span>
                <span className="landing-tech-desc">{tech.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-card glass-panel">
          <h2>Ready to Analyze Your First Document?</h2>
          <p>Sign up for free and upload your first legal PDF in under 30 seconds.</p>
          <Link to="/register" className="landing-btn-cta landing-btn-lg">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-content">
          <span>⚖️ Legal AI Analyzer</span>
          <span className="landing-footer-sep">·</span>
          <span>Full-Stack RAG Application</span>
          <span className="landing-footer-sep">·</span>
          <span>Built with MERN + Gemini + Pinecone</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

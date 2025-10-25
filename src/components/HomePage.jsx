import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

/**
 * Homepage component with modern dark theme design
 * Similar to Martin app with productivity widgets showcase
 */
function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <div className="homepage">
      {/* Header/Navigation */}
      <header className="homepage-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <div className="hexagon">
                <div className="hexagon-inner"></div>
              </div>
            </div>
            <span className="logo-text">ChaTree</span>
          </div>
          
          <nav className="header-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#docs" className="nav-link">Docs</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </nav>
          
          <div className="header-actions">
            <button className="btn-login">Log in</button>
            <button className="btn-get-started" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="homepage-main">
        <div className="homepage-content">
          {/* Left Side - Branding */}
          <div className="homepage-left">
            <h1 className="main-headline">
            Git for LLMs
            </h1>
            
            <p className="main-description">
              Organize, explore, and branch your AI conversations like never before. 
              Create complex dialogue trees with intelligent context management and 
              seamless navigation through your chat history.
            </p>
            
            <button className="btn-try-now" onClick={handleGetStarted}>
              Try it now!
            </button>
          </div>

          {/* Right Side - Terminal Demo */}
          <div className="homepage-right">
            <div className="terminal-demo">
              <div className="terminal-header">
                <div className="terminal-controls">
                  <div className="control-dot red"></div>
                  <div className="control-dot yellow"></div>
                  <div className="control-dot green"></div>
                </div>
                <div className="terminal-title">Terminal</div>
              </div>
              <div className="terminal-content">
                <div className="terminal-line">
                  <span className="prompt">~/chattree</span> <span className="command">git branch</span>
                </div>
                <div className="terminal-output">
                  <div className="output-line">* main</div>
                  <div className="output-line">  react-discussion</div>
                  <div className="output-line">  hooks-exploration</div>
                  <div className="output-line">  state-management</div>
                </div>
                <div className="terminal-line">
                  <span className="prompt">~/chattree</span> <span className="command">git checkout react-discussion</span>
                </div>
                <div className="terminal-output">
                  <div className="output-line success">Switched to branch 'react-discussion'</div>
                </div>
                <div className="terminal-line">
                  <span className="prompt">~/chattree</span> <span className="command">git log --oneline</span>
                </div>
                <div className="terminal-output">
                  <div className="output-line">a1b2c3d How do I use React hooks?</div>
                  <div className="output-line">e4f5g6h React is a JavaScript library...</div>
                  <div className="output-line">i7j8k9l What about useState?</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Footer */}
        <div className="hero-footer">
          <p className="author-text">
            <a href="https://stevenmathew.dev" target="_blank" rel="noopener noreferrer" className="author-link">stevenmathew.dev</a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default HomePage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SearchBar from './SearchBar';

/**
 * Toolbar component for LangFork
 * Provides project management and tree operations
 */
function Toolbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <img src="/assets/logo.svg" alt="LangFork" className="toolbar-logo" />
        <h1 className="toolbar-title">LangFork</h1>
        <span className="toolbar-subtitle">Git for LLM Conversations</span>
      </div>

      <div className="toolbar-center">
        {/* Empty center - can be used for future features */}
      </div>

      <div className="toolbar-right">
        <SearchBar />
        <div className="toolbar-actions" style={{ marginLeft: 12 }}>
          <button className="toolbar-button" onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;

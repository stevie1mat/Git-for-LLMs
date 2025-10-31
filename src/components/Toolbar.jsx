import React from 'react';
import SearchBar from './SearchBar';

/**
 * Toolbar component for LangFork
 * Provides project management and tree operations
 */
function Toolbar() {
  // Toolbar component - currently minimal with just search functionality

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1 className="toolbar-title">LangFork</h1>
        <span className="toolbar-subtitle">Git for LLM Conversations</span>
      </div>

      <div className="toolbar-center">
        {/* Empty center - can be used for future features */}
      </div>

      <div className="toolbar-right">
        <SearchBar />
      </div>
    </div>
  );
}

export default Toolbar;

import React, { useState, useRef, useEffect } from 'react';
import { useChatTree } from '../hooks/useChatTree';
import { useLLM } from '../hooks/useLLM';

/**
 * AI-powered search component for finding related nodes
 */
function SearchBar() {
  const { nodes, setSelectedNode, setActiveNode } = useChatTree();
  const { sendToGemini, sendToMockLLM } = useLLM();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedResultIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
          handleResultClick(searchResults[selectedResultIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSearchResults([]);
        setSelectedResultIndex(-1);
        break;
      default:
        // No action for other keys
        break;
    }
  };

  // Perform AI-powered search
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Prepare context for AI search
      const nodeContexts = nodes.map(node => ({
        id: node.id,
        role: node.role,
        content: node.content,
        timestamp: node.metadata.timestamp
      }));

      const searchPrompt = `You are a search assistant for a conversation tree. Find nodes that are most relevant to the search query: "${query}".

Available nodes:
${nodeContexts.map(node => `ID: ${node.id}\nRole: ${node.role}\nContent: ${node.content.substring(0, 200)}...\n`).join('\n')}

Return a JSON array of the most relevant node IDs, ordered by relevance. Include 3-5 most relevant results.
Format: ["node-id-1", "node-id-2", "node-id-3"]`;

      let aiResponse;
      try {
        aiResponse = await sendToGemini([{ role: 'user', content: searchPrompt }], {
          model: 'gemini-2.0-flash-exp',
          temperature: 0.3,
          maxTokens: 500
        });
      } catch (error) {
        console.warn('Gemini search failed, using mock:', error.message);
        aiResponse = await sendToMockLLM([{ role: 'user', content: searchPrompt }]);
      }

      // Parse AI response to get node IDs
      const responseText = aiResponse.trim();
      let relevantNodeIds = [];
      
      try {
        // Try to extract JSON array from response
        const jsonMatch = responseText.match(/\["([^"]+)",?"([^"]+)",?"([^"]+)",?"([^"]+)",?"([^"]+)"\]/);
        if (jsonMatch) {
          relevantNodeIds = jsonMatch.slice(1).filter(id => id);
        } else {
          // Fallback: extract node IDs from text
          const nodeIdPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g;
          const matches = responseText.match(nodeIdPattern);
          if (matches) {
            relevantNodeIds = matches.slice(0, 5);
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse AI response:', parseError);
      }

      // If AI search fails, fallback to simple text search
      if (relevantNodeIds.length === 0) {
        relevantNodeIds = nodes
          .filter(node => 
            node.content.toLowerCase().includes(query.toLowerCase()) ||
            node.role.toLowerCase().includes(query.toLowerCase())
          )
          .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
          .slice(0, 5)
          .map(node => node.id);
      }

      // Get full node objects for results
      const results = relevantNodeIds
        .map(id => nodes.find(node => node.id === id))
        .filter(node => node)
        .map(node => ({
          id: node.id,
          role: node.role,
          content: node.content,
          timestamp: node.metadata.timestamp,
          isPinned: node.metadata.isPinned
        }));

      setSearchResults(results);
      setIsDropdownOpen(true);
      setSelectedResultIndex(-1);

    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    clearTimeout(searchInputRef.current?.timeout);
    searchInputRef.current = {
      timeout: setTimeout(() => performSearch(query), 300)
    };
  };

  // Handle result click
  const handleResultClick = (result) => {
    setSelectedNode(result.id);
    setActiveNode(result.id);
    
    // Scroll to the selected node
    if (window.scrollToNode) {
      // Small delay to ensure the node is rendered before scrolling
      setTimeout(() => {
        window.scrollToNode(result.id);
      }, 100);
    }
    
    setIsDropdownOpen(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Truncate content for display
  const truncateContent = (content, maxLength = 80) => {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  return (
    <div className="search-container" ref={dropdownRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="Search conversations with AI..."
          className="search-input"
          autoComplete="off"
        />
        {isSearching && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {isDropdownOpen && searchResults.length > 0 && (
        <div className="search-dropdown">
          <div className="search-results-header">
            <span>Search Results ({searchResults.length})</span>
          </div>
          {searchResults.map((result, index) => (
            <div
              key={result.id}
              className={`search-result ${index === selectedResultIndex ? 'selected' : ''}`}
              onClick={() => handleResultClick(result)}
            >
              <div className="result-header">
                <span className="result-role">{result.role.toUpperCase()}</span>
                {result.isPinned && <span className="pinned-indicator">📌</span>}
                <span className="result-timestamp">{formatTimestamp(result.timestamp)}</span>
              </div>
              <div className="result-content">
                {truncateContent(result.content)}
              </div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
        <div className="search-dropdown">
          <div className="no-results">
            <span>No matching conversations found</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;

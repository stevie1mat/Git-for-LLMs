import React, { useState, useRef } from 'react';

/**
 * Message input component for sending new messages
 * Handles both regular messages and branching from specific nodes
 */
function MessageInput({ onSendMessage, onBranchFromNode, isLoading, error }) {
  const [message, setMessage] = useState('');
  const [isBranchMode, setIsBranchMode] = useState(false);
  const [branchNodeId, setBranchNodeId] = useState(null);
  const textareaRef = useRef(null);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) {
      return;
    }

    try {
      if (isBranchMode && branchNodeId) {
        await onBranchFromNode(branchNodeId, message);
      } else {
        await onSendMessage(message);
      }
      
      setMessage('');
      setIsBranchMode(false);
      setBranchNodeId(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // const handleBranchMode = (nodeId) => {
  //   setIsBranchMode(true);
  //   setBranchNodeId(nodeId);
  //   textareaRef.current?.focus();
  // };

  const cancelBranchMode = () => {
    setIsBranchMode(false);
    setBranchNodeId(null);
  };

  return (
    <div className="message-input-container">
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {isBranchMode && (
        <div className="branch-mode-indicator">
          <span>Branching from node: {branchNodeId?.slice(0, 8)}...</span>
          <button onClick={cancelBranchMode} className="cancel-branch-btn">
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-group">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isBranchMode 
                ? "Type your message to branch from the selected node..."
                : "Type your message here..."
            }
            disabled={isLoading}
            className="message-textarea"
            rows={3}
          />
          
          <div className="input-actions">
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="send-button"
              onClick={(e) => {
                if (!message.trim() || isLoading) {
                  e.preventDefault();
                  return;
                }
              }}
              style={{
                backgroundColor: (!message.trim() || isLoading) ? '#9ca3af' : '#3b82f6',
                cursor: (!message.trim() || isLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Sending...' : (isBranchMode ? 'Branch' : 'Send')}
            </button>
          </div>
        </div>
      </form>

      <div className="input-help">
        <small>
          Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line
        </small>
      </div>
    </div>
  );
}

export default MessageInput;

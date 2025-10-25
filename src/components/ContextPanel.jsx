import React from 'react';
import { useChatTree } from '../hooks/useChatTree';
import { getContextSummary } from '../utils/contextCompiler';
import { getPathToRoot } from '../utils/treeUtils';

/**
 * Context panel component
 * Shows information about the current context and pinned nodes
 */
function ContextPanel({ showConversationOnly = false }) {
  const { nodes, activeNodeId, selectedNodeId, togglePin } = useChatTree();

  const contextSummary = activeNodeId ? getContextSummary(nodes, activeNodeId) : null;
  const pinnedNodes = nodes.filter(node => node.metadata.isPinned);
  const selectedNode = nodes.find(node => node.id === selectedNodeId);
  
  // Get full conversation path when a node is selected
  const fullConversation = selectedNodeId ? getPathToRoot(nodes, selectedNodeId) : [];

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateContent = (content, maxLength = 50) => {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  // If only showing conversation, return just the conversation part
  if (showConversationOnly) {
    return (
      <div className="conversation-panel-content">
        {fullConversation.length > 0 ? (
          <div className="full-conversation">
            <h4>Full Chat Conversation</h4>
            <div className="conversation-container">
              {fullConversation.map((node, index) => (
                <div 
                  key={node.id} 
                  className={`conversation-message ${node.role} ${node.id === selectedNodeId ? 'selected' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-role">{node.role.toUpperCase()}</span>
                    <span className="message-timestamp">
                      {formatTimestamp(node.metadata.timestamp)}
                    </span>
                  </div>
                  <div className="message-content">
                    {node.content}
                  </div>
                  {node.metadata.modelUsed && (
                    <div className="message-meta">
                      <span className="model-info">Model: {node.metadata.modelUsed}</span>
                      {node.metadata.tokenCount > 0 && (
                        <span className="token-info">Tokens: {node.metadata.tokenCount}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-conversation">
            <p>Click on a node to view the full conversation.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="context-panel">
      {contextSummary && (
        <div className="context-summary">
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Pinned Nodes:</span>
              <span className="stat-value">{contextSummary.pinnedCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Ancestor Path:</span>
              <span className="stat-value">{contextSummary.ancestorCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Context:</span>
              <span className="stat-value">{contextSummary.totalContextNodes}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Est. Tokens:</span>
              <span className="stat-value">{contextSummary.totalTokens}</span>
            </div>
          </div>
        </div>
      )}

      {pinnedNodes.length > 0 && (
        <div className="pinned-nodes">
          <h4>Pinned Nodes</h4>
          <div className="pinned-list">
            {pinnedNodes.map(node => (
              <div key={node.id} className="pinned-node">
                <div className="node-header">
                  <span className="node-role">{node.role}</span>
                  <button
                    onClick={() => togglePin(node.id)}
                    className="unpin-button"
                    title="Unpin from context"
                  >
                    📌
                  </button>
                </div>
                <div className="node-content">
                  {truncateContent(node.content)}
                </div>
                <div className="node-meta">
                  {formatTimestamp(node.metadata.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="selected-node-info">
          <h4>Selected Node</h4>
          <div className="node-details">
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{selectedNode.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{selectedNode.role}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Children:</span>
              <span className="detail-value">{selectedNode.children.length}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Pinned:</span>
              <span className="detail-value">
                {selectedNode.metadata.isPinned ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Timestamp:</span>
              <span className="detail-value">
                {formatTimestamp(selectedNode.metadata.timestamp)}
              </span>
            </div>
            {selectedNode.metadata.modelUsed && (
              <div className="detail-row">
                <span className="detail-label">Model:</span>
                <span className="detail-value">{selectedNode.metadata.modelUsed}</span>
              </div>
            )}
            {selectedNode.metadata.tokenCount > 0 && (
              <div className="detail-row">
                <span className="detail-label">Tokens:</span>
                <span className="detail-value">{selectedNode.metadata.tokenCount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!activeNodeId && (
        <div className="no-active-node">
          <p>No active node selected. Click on a node to make it active.</p>
        </div>
      )}
    </div>
  );
}

export default ContextPanel;

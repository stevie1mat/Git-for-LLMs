import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * Custom message node component for React Flow
 * Displays individual messages in the conversation tree
 */
const MessageNode = memo(({ data }) => {
  const { node, isActive, isSelected, depth, onSelect, onActivate, onTogglePin, onDelete } = data;
  const { role, content, metadata, parentId } = node;
  
  // Check if this is a sub-branch (child of an assistant node)
  const isSubBranch = parentId && depth > 1;

  const handleClick = () => {
    onSelect();
  };

  const handleDoubleClick = () => {
    onActivate();
  };

  const handlePinToggle = (e) => {
    e.stopPropagation();
    onTogglePin();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this branch and all its sub-branches? This action cannot be undone.')) {
      onDelete();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getNodeStyle = () => {
    const baseStyle = {
      padding: '16px',
      borderRadius: '12px',
      border: '2px solid',
      minWidth: '220px',
      maxWidth: '320px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      background: '#111111'
    };

    // Special styling for sub-branches
    if (isSubBranch) {
      const subBranchStyle = {
        ...baseStyle,
        borderColor: '#ffffff',
        backgroundColor: '#1a1a1a',
        borderStyle: 'dashed',
        borderWidth: '2px',
        boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)'
      };
      
      if (isActive) {
        return {
          ...subBranchStyle,
          borderColor: '#ffffff',
          backgroundColor: '#2a2a2a',
          boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.2)'
        };
      }
      
      return subBranchStyle;
    }

    if (isActive) {
      return {
        ...baseStyle,
        borderColor: '#ffffff',
        backgroundColor: '#1a1a1a',
        boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.2)'
      };
    }

    if (isSelected) {
      return {
        ...baseStyle,
        borderColor: '#cccccc',
        backgroundColor: '#1a1a1a',
        boxShadow: '0 2px 12px rgba(255, 255, 255, 0.1)'
      };
    }

    if (role === 'user') {
      return {
        ...baseStyle,
        borderColor: '#333333',
        backgroundColor: '#0f0f0f'
      };
    }

    return {
      ...baseStyle,
      borderColor: '#2a2a2a',
      backgroundColor: '#111111'
    };
  };

  const getContentStyle = () => {
    return {
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#ffffff',
      marginBottom: '10px',
      wordWrap: 'break-word'
    };
  };

  const getMetadataStyle = () => {
    return {
      fontSize: '11px',
      color: '#888888',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    };
  };

  return (
    <div style={getNodeStyle()} onClick={handleClick} onDoubleClick={handleDoubleClick}>
      {/* Action buttons */}
      <div style={{
        position: 'absolute',
        top: '4px',
        right: '4px',
        display: 'flex',
        gap: '4px'
      }}>
        {/* Pin toggle button */}
        <button
          onClick={handlePinToggle}
          style={{
            background: metadata.isPinned ? '#ffffff' : '#2a2a2a',
            border: '1px solid #444444',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
            color: metadata.isPinned ? '#000000' : '#ffffff',
            transition: 'all 0.2s ease'
          }}
          title={metadata.isPinned ? 'Unpin from context' : 'Pin to context'}
        >
          {metadata.isPinned ? '📌' : '📍'}
        </button>
        
        {/* Delete button */}
        <button
          onClick={handleDelete}
          style={{
            background: '#2a2a2a',
            border: '1px solid #444444',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
            color: '#ff6666',
            transition: 'all 0.2s ease'
          }}
          title="Delete this branch and all sub-branches"
        >
          🗑️
        </button>
      </div>

      {/* Role indicator */}
      <div style={{
        fontSize: '10px',
        fontWeight: '500',
        color: role === 'user' ? '#ffffff' : '#cccccc',
        marginBottom: '6px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        letterSpacing: '0.5px'
      }}>
        {isSubBranch && <span style={{ color: '#ffffff' }}>↳</span>}
        {role}
        {isSubBranch && <span style={{ color: '#ffffff', fontSize: '8px', background: '#333333', padding: '1px 4px', borderRadius: '3px' }}>SUB</span>}
      </div>

      {/* Message content */}
      <div style={getContentStyle()}>
        {content.length > 100 ? `${content.substring(0, 100)}...` : content}
      </div>

      {/* Metadata */}
      <div style={getMetadataStyle()}>
        <span>{formatTimestamp(metadata.timestamp)}</span>
        {metadata.tokenCount > 0 && (
          <span>{metadata.tokenCount} tokens</span>
        )}
      </div>

      {/* Depth indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2px',
        left: '4px',
        fontSize: '8px',
        color: '#9ca3af'
      }}>
        D{depth}
      </div>

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#10b981', width: '8px', height: '8px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#3b82f6', width: '8px', height: '8px' }}
      />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';

export default MessageNode;

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
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid',
      minWidth: '200px',
      maxWidth: '300px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    };

    // Special styling for sub-branches
    if (isSubBranch) {
      const subBranchStyle = {
        ...baseStyle,
        borderColor: '#3b82f6',
        backgroundColor: '#f0f9ff',
        borderStyle: 'dashed',
        borderWidth: '2px',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
      };
      
      if (isActive) {
        return {
          ...subBranchStyle,
          borderColor: '#1d4ed8',
          backgroundColor: '#dbeafe',
          boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.2)'
        };
      }
      
      return subBranchStyle;
    }

    if (isActive) {
      return {
        ...baseStyle,
        borderColor: '#3b82f6',
        backgroundColor: '#eff6ff',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      };
    }

    if (isSelected) {
      return {
        ...baseStyle,
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4'
      };
    }

    if (role === 'user') {
      return {
        ...baseStyle,
        borderColor: '#6366f1',
        backgroundColor: '#f8fafc'
      };
    }

    return {
      ...baseStyle,
      borderColor: '#64748b',
      backgroundColor: '#f1f5f9'
    };
  };

  const getContentStyle = () => {
    return {
      fontSize: '14px',
      lineHeight: '1.4',
      color: '#374151',
      marginBottom: '8px',
      wordWrap: 'break-word'
    };
  };

  const getMetadataStyle = () => {
    return {
      fontSize: '11px',
      color: '#6b7280',
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
            background: metadata.isPinned ? '#fbbf24' : '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer',
            color: metadata.isPinned ? '#92400e' : '#6b7280'
          }}
          title={metadata.isPinned ? 'Unpin from context' : 'Pin to context'}
        >
          {metadata.isPinned ? '📌' : '📍'}
        </button>
        
        {/* Delete button */}
        <button
          onClick={handleDelete}
          style={{
            background: '#fecaca',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer',
            color: '#dc2626'
          }}
          title="Delete this branch and all sub-branches"
        >
          🗑️
        </button>
      </div>

      {/* Role indicator */}
      <div style={{
        fontSize: '10px',
        fontWeight: 'bold',
        color: role === 'user' ? '#6366f1' : '#64748b',
        marginBottom: '4px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {isSubBranch && <span style={{ color: '#3b82f6' }}>↳</span>}
        {role}
        {isSubBranch && <span style={{ color: '#3b82f6', fontSize: '8px' }}>SUB</span>}
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

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useChatTree } from '../hooks/useChatTree';
import { useLLM } from '../hooks/useLLM';
import MessageNode from './MessageNode';
import MessageInput from './MessageInput';
import ContextPanel from './ContextPanel';
import Terminal from './Terminal';

// Custom node types
const nodeTypes = {
  messageNode: MessageNode,
};

/**
 * Inner component that has access to React Flow instance
 */
function ChatTreeInner() {
  const {
    nodes,
    activeNodeId,
    selectedNodeId,
    sendMessage,
    branchFromNode,
    setActiveNode,
    setSelectedNode,
    togglePin,
    deleteNode,
    createInitialNode,
    getNodeDepth
  } = useChatTree();

  const { sendToGemini, sendToMockLLM, isLoading, error } = useLLM();
  
  // State for collapsible context panel
  const [isContextPanelCollapsed, setIsContextPanelCollapsed] = useState(false);
  
  // State for terminal
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);

  // Convert tree nodes to React Flow format
  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([]);

  // Get React Flow instance for scrolling
  const { fitView, getNode } = useReactFlow();

  // Function to scroll to a specific node
  const scrollToNode = useCallback((nodeId) => {
    const node = getNode(nodeId);
    if (node) {
      // Use fitView with specific node
      fitView({ 
        nodes: [{ id: nodeId }], 
        duration: 800,
        padding: 0.1 
      });
    }
  }, [fitView, getNode]);

  // Expose scrollToNode function globally for SearchBar to use
  useEffect(() => {
    window.scrollToNode = scrollToNode;
    return () => {
      delete window.scrollToNode;
    };
  }, [scrollToNode]);

  // Calculate positions for all nodes to create proper tree structure
  const calculateAllNodePositions = useCallback(() => {
    const positions = new Map();
    
    // Process nodes in order of depth to ensure parents are calculated first
    const sortedNodes = [...nodes].sort((a, b) => {
      const depthA = getNodeDepth(a.id);
      const depthB = getNodeDepth(b.id);
      return depthA - depthB;
    });
    
    sortedNodes.forEach(node => {
      if (node.parentId === null) {
        // Root node at center
        positions.set(node.id, { x: 0, y: 0 });
      } else {
        // Get parent position
        const parentPos = positions.get(node.parentId);
        if (!parentPos) return;
        
        // Get all children of the same parent
        const siblings = nodes.filter(n => n.parentId === node.parentId);
        const siblingIndex = siblings.findIndex(n => n.id === node.id);
        
        // Calculate position relative to parent
        const childSpacing = 400; // Increased spacing for better tree structure
        const totalChildren = siblings.length;
        const startX = parentPos.x - (totalChildren - 1) * childSpacing / 2;
        
        // Position children below and spread horizontally from parent
        const x = startX + siblingIndex * childSpacing;
        const y = parentPos.y + 300; // Increased vertical spacing
        
        positions.set(node.id, { x, y });
      }
    });
    
    return positions;
  }, [nodes, getNodeDepth]);

  // Calculate position for a specific node
  const calculateNodePosition = useCallback((node) => {
    const positions = calculateAllNodePositions();
    return positions.get(node.id) || { x: 0, y: 0 };
  }, [calculateAllNodePositions]);

  // Initialize with root node if tree is empty
  useEffect(() => {
    if (nodes.length === 0) {
      createInitialNode();
    }
  }, [nodes.length, createInitialNode]);

  // Convert tree nodes to React Flow nodes
  useEffect(() => {
    const flowNodes = nodes.map(node => ({
      id: node.id,
      type: 'messageNode',
      position: calculateNodePosition(node),
      data: {
        node,
        isActive: node.id === activeNodeId,
        isSelected: node.id === selectedNodeId,
        depth: getNodeDepth(node.id),
        onSelect: () => setSelectedNode(node.id),
        onActivate: () => setActiveNode(node.id),
        onTogglePin: () => togglePin(node.id),
        onDelete: () => deleteNode(node.id)
      }
    }));

    const flowEdges = nodes
      .filter(node => node.parentId)
      .map(node => {
        const parentNode = nodes.find(n => n.id === node.parentId);
        const isSubBranch = parentNode && parentNode.role === 'assistant';
        const nodeDepth = getNodeDepth(node.id);
        const isMainFlow = nodeDepth <= 2 && !isSubBranch;
        
        return {
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'smoothstep',
          animated: node.id === activeNodeId,
          style: {
            stroke: isSubBranch ? '#3b82f6' : (isMainFlow ? '#64748b' : '#10b981'),
            strokeWidth: isSubBranch ? 3 : (isMainFlow ? 2 : 2.5),
            strokeDasharray: isSubBranch ? '8,4' : (isMainFlow ? '0' : '4,2')
          },
          label: isSubBranch ? 'sub' : (isMainFlow ? '' : 'deep'),
          labelStyle: {
            fontSize: 9,
            fill: isSubBranch ? '#3b82f6' : (isMainFlow ? '#64748b' : '#10b981')
          }
        };
      });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [nodes, activeNodeId, selectedNodeId, setActiveNode, setSelectedNode, togglePin, deleteNode, getNodeDepth, calculateNodePosition, setNodes, setEdges]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (messageText) => {
    if (!activeNodeId) {
      return;
    }

    try {
      await sendMessage(messageText, async (context) => {
        // Try Gemini first, fallback to mock if no API key
        try {
          return await sendToGemini(context, {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.7,
            maxTokens: 2000
          });
        } catch (geminiError) {
          console.warn('Gemini API not available, using mock:', geminiError.message);
          return await sendToMockLLM(context);
        }
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [activeNodeId, sendMessage, sendToGemini, sendToMockLLM]);

  // Handle branching from a node
  const handleBranchFromNode = useCallback(async (nodeId, messageText) => {
    try {
      await branchFromNode(nodeId, messageText, async (context) => {
        // Try Gemini first, fallback to mock if no API key
        try {
          return await sendToGemini(context, {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.7,
            maxTokens: 2000
          });
        } catch (geminiError) {
          console.warn('Gemini API not available, using mock:', geminiError.message);
          return await sendToMockLLM(context);
        }
      });
    } catch (err) {
      console.error('Failed to branch from node:', err);
    }
  }, [branchFromNode, sendToGemini, sendToMockLLM]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  // Handle edge click (for branching)
  const onEdgeClick = useCallback((event, edge) => {
    // Could implement edge-based interactions here
  }, []);

  return (
    <div className="langfork-container">
      <div className="langfork-main">
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
        {/* Terminal button placed where the minimap used to be (bottom-right inside canvas) */}
        <button 
          className="terminal-rect-button"
          onClick={() => setIsTerminalVisible(!isTerminalVisible)}
          title="Open Terminal"
        >
          LangFork Terminal
        </button>
        {/* Docked terminal inside canvas area */}
        <Terminal 
          isVisible={isTerminalVisible}
          onToggle={() => setIsTerminalVisible(!isTerminalVisible)}
          docked
        />
      </div>
      
      <div className="langfork-sidebar">
        {/* Collapsible Context Panel */}
        <div className={`context-panel-container ${isContextPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="context-panel-header">
            <h3>Context Information</h3>
            <button 
              className="collapse-toggle"
              onClick={() => setIsContextPanelCollapsed(!isContextPanelCollapsed)}
              title={isContextPanelCollapsed ? 'Expand context panel' : 'Collapse context panel'}
            >
              {isContextPanelCollapsed ? '▶' : '▼'}
            </button>
          </div>
          {!isContextPanelCollapsed && <ContextPanel />}
        </div>
        
        {/* Conversation Panel */}
        <div className="conversation-panel">
          <ContextPanel showConversationOnly={true} />
        </div>
        
        <MessageInput 
          onSendMessage={handleSendMessage}
          onBranchFromNode={handleBranchFromNode}
          isLoading={isLoading}
          error={error}
        />
      </div>
      
      {/* Removed floating toggle in favor of bottom-right rectangle button */}
      
      {/* Removed global full-screen Terminal */}
    </div>
  );
}

// Wrap with ReactFlowProvider for proper context
export default function ChatTreeWithProvider() {
  return (
    <ReactFlowProvider>
      <ChatTreeInner />
    </ReactFlowProvider>
  );
}

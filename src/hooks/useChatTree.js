import { useCallback } from 'react';
import { useTree } from '../context/TreeContext';
import { compileContext } from '../utils/contextCompiler';

/**
 * Custom hook for ChatTree operations
 * Provides high-level functions for tree manipulation
 */
export function useChatTree() {
  const {
    nodes,
    activeNodeId,
    selectedNodeId,
    addNode,
    setActiveNode,
    setSelectedNode,
    togglePin,
    deleteNode,
    createInitialNode
  } = useTree();

  /**
   * Sends a new message from the active node
   * @param {string} messageText - The user's message
   * @param {Function} onLLMResponse - Callback for LLM response
   */
  const sendMessage = useCallback(async (messageText, onLLMResponse) => {
    if (!activeNodeId || !messageText.trim()) {
      return;
    }

    try {
      // Check if there is a pinned node (only one can be pinned at a time)
      const pinnedNode = nodes.find(node => node.metadata.isPinned);
      
      // If there is a pinned node, create sub-nodes from it
      // Otherwise, use the active node as before
      const parentNodeId = pinnedNode ? pinnedNode.id : activeNodeId;

      // Create user message node
      const userNode = addNode({
        parentId: parentNodeId,
        role: 'user',
        content: messageText.trim(),
        metadata: { isPinned: false }
      });

      // Compile context for LLM - use the parent node for context compilation
      const context = compileContext(nodes, parentNodeId, messageText);
      
      // Call LLM API (this would be implemented in useLLM hook)
      if (onLLMResponse) {
        const aiResponse = await onLLMResponse(context);
        
        // Create AI response node
        const aiNode = addNode({
          parentId: userNode.id,
          role: 'assistant',
          content: aiResponse,
          metadata: { 
            isPinned: false,
            modelUsed: 'gemini-2.0-flash-exp',
            tokenCount: Math.ceil(aiResponse.length / 4) // Rough estimation
          }
        });

        // Set the AI response as the new active node
        setActiveNode(aiNode.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [nodes, activeNodeId, addNode, setActiveNode]);

  /**
   * Branches from any node in the tree
   * @param {string} nodeId - ID of the node to branch from
   * @param {string} messageText - The user's message
   * @param {Function} onLLMResponse - Callback for LLM response
   */
  const branchFromNode = useCallback(async (nodeId, messageText, onLLMResponse) => {
    if (!nodeId || !messageText.trim()) {
      return;
    }

    try {
      // Create user message node
      const userNode = addNode({
        parentId: nodeId,
        role: 'user',
        content: messageText.trim(),
        metadata: { isPinned: false }
      });

      // Compile context for LLM
      const context = compileContext(nodes, nodeId, messageText);
      
      // Call LLM API
      if (onLLMResponse) {
        const aiResponse = await onLLMResponse(context);
        
        // Create AI response node
        const aiNode = addNode({
          parentId: userNode.id,
          role: 'assistant',
          content: aiResponse,
          metadata: { 
            isPinned: false,
            modelUsed: 'gemini-2.0-flash-exp',
            tokenCount: Math.ceil(aiResponse.length / 4)
          }
        });

        // Set the AI response as the new active node
        setActiveNode(aiNode.id);
      }
    } catch (error) {
      console.error('Failed to branch from node:', error);
    }
  }, [nodes, addNode, setActiveNode]);

  /**
   * Gets the root node of the tree
   * @returns {Node|null} Root node or null
   */
  const getRootNode = useCallback(() => {
    return nodes.find(node => node.parentId === null);
  }, [nodes]);

  /**
   * Gets all leaf nodes (nodes with no children)
   * @returns {Node[]} Array of leaf nodes
   */
  const getLeafNodes = useCallback(() => {
    return nodes.filter(node => node.children.length === 0);
  }, [nodes]);

  /**
   * Gets the depth of a node in the tree
   * @param {string} nodeId - Node ID
   * @returns {number} Depth level
   */
  const getNodeDepth = useCallback((nodeId) => {
    let depth = 0;
    let currentNode = nodes.find(n => n.id === nodeId);
    
    while (currentNode && currentNode.parentId) {
      depth++;
      const parentId = currentNode.parentId;
      currentNode = nodes.find(n => n.id === parentId);
    }
    
    return depth;
  }, [nodes]);

  /**
   * Gets the path from root to a specific node
   * @param {string} nodeId - Target node ID
   * @returns {Node[]} Path array
   */
  const getNodePath = useCallback((nodeId) => {
    const path = [];
    let currentNode = nodes.find(n => n.id === nodeId);
    
    while (currentNode) {
      path.unshift(currentNode);
      const parentId = currentNode.parentId;
      currentNode = parentId ? nodes.find(n => n.id === parentId) : null;
    }
    
    return path;
  }, [nodes]);

  return {
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
    getRootNode,
    getLeafNodes,
    getNodeDepth,
    getNodePath
  };
}

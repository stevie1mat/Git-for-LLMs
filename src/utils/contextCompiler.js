/**
 * Context Compilation Algorithm for ChatTree
 * This is the core logic that determines what context to send to the LLM
 * Implements hierarchical memory system where:
 * - Main branch has memory of all sub-branches
 * - Sub-branches have isolated memory (no knowledge of other sub-branches)
 */

import { getPathToRoot, getDescendants } from './treeUtils.js';

/**
 * Compiles context for a new message based on hierarchical memory system
 * @param {Node[]} allNodes - All nodes in the tree
 * @param {string} activeNodeId - ID of the node from which the new message is being sent
 * @param {string} newPromptText - The new user prompt
 * @returns {Object[]} Array of messages in OpenAI format for LLM API
 */
export function compileContext(allNodes, activeNodeId, newPromptText) {
  const contextMessages = [];
  const addedIds = new Set();
  
  // Debug logging
  console.log('🔍 Context Compilation Debug:');
  console.log('Active Node ID:', activeNodeId);
  console.log('Total nodes:', allNodes.length);
  console.log('New prompt:', newPromptText);
  
  // Step 1: Get Pinned Context (Global context)
  const pinnedNodes = allNodes.filter(node => node.metadata.isPinned);
  console.log('Pinned nodes:', pinnedNodes.length);
  for (const node of pinnedNodes) {
    if (!addedIds.has(node.id)) {
      contextMessages.push({
        role: node.role,
        content: node.content
      });
      addedIds.add(node.id);
    }
  }
  
  // Step 2: Determine if we're in a sub-branch or main branch
  const activeNode = allNodes.find(n => n.id === activeNodeId);
  console.log('Active node:', activeNode);
  
  // Get the path to root to understand the branch structure
  const ancestorPath = getPathToRoot(allNodes, activeNodeId);
  console.log('Ancestor path:', ancestorPath.map(n => ({ id: n.id, role: n.role, content: n.content.substring(0, 50) + '...' })));
  
  // We're in the main branch if the active node is the root (no parent)
  // We're in a sub-branch if the active node has a parent
  const isInMainBranch = !activeNode || !activeNode.parentId;
  const isInSubBranch = !isInMainBranch;
  console.log('Is in main branch:', isInMainBranch);
  console.log('Is in sub-branch:', isInSubBranch);
  
  if (isInSubBranch) {
    // Step 2a: For sub-branches, only include ancestor path (isolated memory)
    console.log('🔒 Sub-branch: Using isolated memory');
    for (const node of ancestorPath) {
      if (!addedIds.has(node.id)) {
        contextMessages.unshift({
          role: node.role,
          content: node.content
        });
        addedIds.add(node.id);
      }
    }
  } else {
    // Step 2b: For main branch, include ancestor path + all descendants (full memory)
    console.log('🧠 Main branch: Using hierarchical memory');
    
    // Add ancestor path
    for (const node of ancestorPath) {
      if (!addedIds.has(node.id)) {
        contextMessages.unshift({
          role: node.role,
          content: node.content
        });
        addedIds.add(node.id);
      }
    }
    
    // Add all descendants of the main branch (sub-branch memories)
    const rootNode = ancestorPath[0]; // First node in path is root
    console.log('Root node:', rootNode);
    if (rootNode) {
      const allDescendants = getDescendants(allNodes, rootNode.id);
      console.log('All descendants count:', allDescendants.length);
      console.log('Descendants:', allDescendants.map(d => ({ id: d.id, role: d.role, content: d.content.substring(0, 50) + '...' })));
      
      // Sort descendants by timestamp to maintain chronological order
      const sortedDescendants = allDescendants.sort((a, b) => 
        a.metadata.timestamp - b.metadata.timestamp
      );
      
      for (const node of sortedDescendants) {
        if (!addedIds.has(node.id)) {
          contextMessages.push({
            role: node.role,
            content: node.content
          });
          addedIds.add(node.id);
        }
      }
    }
  }
  
  // Step 3: Add New Prompt
  contextMessages.push({
    role: 'user',
    content: newPromptText
  });
  
  // Debug: Log final context
  console.log('Final context messages count:', contextMessages.length);
  console.log('Context messages:', contextMessages.map(msg => ({ 
    role: msg.role, 
    content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '') 
  })));
  
  // Step 4: Return compiled context
  return contextMessages;
}

/**
 * Gets context summary for display purposes with hierarchical memory info
 * @param {Node[]} allNodes - All nodes in the tree
 * @param {string} activeNodeId - ID of the active node
 * @returns {Object} Context summary with counts and preview
 */
export function getContextSummary(allNodes, activeNodeId) {
  const pinnedCount = allNodes.filter(node => node.metadata.isPinned).length;
  const ancestorPath = getPathToRoot(allNodes, activeNodeId);
  const ancestorCount = ancestorPath.length;
  
  // Determine if we're in a sub-branch or main branch
  const activeNode = allNodes.find(n => n.id === activeNodeId);
  const isInSubBranch = activeNode && activeNode.parentId !== null;
  
  let descendantCount = 0;
  let totalContextNodes = pinnedCount + ancestorCount;
  
  if (!isInSubBranch) {
    // For main branch, include all descendants
    const rootNode = ancestorPath[0];
    if (rootNode) {
      const allDescendants = getDescendants(allNodes, rootNode.id);
      descendantCount = allDescendants.length;
      totalContextNodes = pinnedCount + ancestorCount + descendantCount;
    }
  }
  
  // Calculate total token count for context
  const pinnedNodes = allNodes.filter(node => node.metadata.isPinned);
  let contextNodes = [...pinnedNodes, ...ancestorPath];
  
  if (!isInSubBranch) {
    const rootNode = ancestorPath[0];
    if (rootNode) {
      const allDescendants = getDescendants(allNodes, rootNode.id);
      contextNodes = [...contextNodes, ...allDescendants];
    }
  }
  
  const totalTokens = contextNodes.reduce((sum, node) => sum + (node.metadata.tokenCount || 0), 0);
  
  return {
    pinnedCount,
    ancestorCount,
    descendantCount,
    totalContextNodes,
    totalTokens,
    isInSubBranch,
    memoryType: isInSubBranch ? 'isolated' : 'hierarchical',
    ancestorPath: ancestorPath.map(node => ({
      id: node.id,
      role: node.role,
      content: node.content.substring(0, 100) + (node.content.length > 100 ? '...' : ''),
      timestamp: node.metadata.timestamp
    }))
  };
}

/**
 * Validates context before sending to LLM
 * @param {Object[]} contextMessages - Compiled context messages
 * @param {number} maxTokens - Maximum tokens allowed
 * @returns {Object} Validation result
 */
export function validateContext(contextMessages, maxTokens = 100000) {
  const totalTokens = contextMessages.reduce((sum, msg) => {
    // Rough token estimation (4 characters ≈ 1 token)
    return sum + Math.ceil(msg.content.length / 4);
  }, 0);
  
  const warnings = [];
  if (totalTokens > maxTokens) {
    warnings.push(`Context may exceed token limit: ${totalTokens} tokens`);
  }
  
  if (contextMessages.length === 0) {
    warnings.push('No context messages found');
  }
  
  return {
    isValid: warnings.length === 0,
    totalTokens,
    warnings
  };
}

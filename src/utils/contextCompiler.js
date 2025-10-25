/**
 * Context Compilation Algorithm for ChatTree
 * This is the core logic that determines what context to send to the LLM
 */

import { getPathToRoot } from './treeUtils.js';

/**
 * Compiles context for a new message based on pinned nodes and ancestor path
 * @param {Node[]} allNodes - All nodes in the tree
 * @param {string} activeNodeId - ID of the node from which the new message is being sent
 * @param {string} newPromptText - The new user prompt
 * @returns {Object[]} Array of messages in OpenAI format for LLM API
 */
export function compileContext(allNodes, activeNodeId, newPromptText) {
  const contextMessages = [];
  const addedIds = new Set();
  
  // Step 1: Get Pinned Context
  const pinnedNodes = allNodes.filter(node => node.metadata.isPinned);
  for (const node of pinnedNodes) {
    if (!addedIds.has(node.id)) {
      contextMessages.push({
        role: node.role,
        content: node.content
      });
      addedIds.add(node.id);
    }
  }
  
  // Step 2: Get Ancestor Path
  const ancestorPath = getPathToRoot(allNodes, activeNodeId);
  for (const node of ancestorPath) {
    if (!addedIds.has(node.id)) {
      // Add to front to maintain chronological order
      contextMessages.unshift({
        role: node.role,
        content: node.content
      });
      addedIds.add(node.id);
    }
  }
  
  // Step 3: Add New Prompt
  contextMessages.push({
    role: 'user',
    content: newPromptText
  });
  
  // Step 4: Return compiled context
  return contextMessages;
}

/**
 * Gets context summary for display purposes
 * @param {Node[]} allNodes - All nodes in the tree
 * @param {string} activeNodeId - ID of the active node
 * @returns {Object} Context summary with counts and preview
 */
export function getContextSummary(allNodes, activeNodeId) {
  const pinnedCount = allNodes.filter(node => node.metadata.isPinned).length;
  const ancestorPath = getPathToRoot(allNodes, activeNodeId);
  const ancestorCount = ancestorPath.length;
  
  // Calculate total token count for context
  const pinnedNodes = allNodes.filter(node => node.metadata.isPinned);
  const totalTokens = [...pinnedNodes, ...ancestorPath]
    .reduce((sum, node) => sum + (node.metadata.tokenCount || 0), 0);
  
  return {
    pinnedCount,
    ancestorCount,
    totalContextNodes: pinnedCount + ancestorCount,
    totalTokens,
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

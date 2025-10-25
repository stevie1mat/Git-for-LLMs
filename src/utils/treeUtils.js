/**
 * Tree Utilities for ChatTree
 * Core data structures and tree manipulation functions
 */

/**
 * Node data structure for the conversation tree
 * @typedef {Object} Node
 * @property {string} id - Unique identifier (UUID)
 * @property {string|null} parentId - ID of parent node (null for root)
 * @property {string[]} children - Array of child node IDs
 * @property {'user'|'assistant'} role - Message role
 * @property {string} content - Message content
 * @property {Object} metadata - Additional node metadata
 * @property {number} metadata.timestamp - Unix timestamp
 * @property {string} metadata.modelUsed - LLM model used for assistant messages
 * @property {number} metadata.tokenCount - Token count for the message
 * @property {boolean} metadata.isPinned - Whether node is pinned for context
 */

/**
 * Creates a new node with the specified properties
 * @param {Object} props - Node properties
 * @param {string} props.parentId - Parent node ID
 * @param {'user'|'assistant'} props.role - Message role
 * @param {string} props.content - Message content
 * @param {Object} props.metadata - Additional metadata
 * @returns {Node} New node object
 */
export function createNode({ parentId, role, content, metadata = {} }) {
  return {
    id: generateUUID(),
    parentId,
    children: [],
    role,
    content,
    metadata: {
      timestamp: Date.now(),
      modelUsed: metadata.modelUsed || null,
      tokenCount: metadata.tokenCount || 0,
      isPinned: metadata.isPinned || false,
      ...metadata
    }
  };
}

/**
 * Generates a UUID v4
 * @returns {string} UUID string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

/**
 * Adds a child node to a parent node
 * @param {Node} parentNode - Parent node to modify
 * @param {string} childId - ID of child node to add
 */
export function addChildToNode(parentNode, childId) {
  if (!parentNode.children.includes(childId)) {
    parentNode.children.push(childId);
  }
}

/**
 * Finds a node by ID in a flat array of nodes
 * @param {Node[]} nodes - Array of all nodes
 * @param {string} nodeId - ID to search for
 * @returns {Node|undefined} Found node or undefined
 */
export function findNodeById(nodes, nodeId) {
  return nodes.find(node => node.id === nodeId);
}

/**
 * Gets all descendant nodes of a given node
 * @param {Node[]} nodes - Array of all nodes
 * @param {string} nodeId - ID of the root node
 * @returns {Node[]} Array of descendant nodes
 */
export function getDescendants(nodes, nodeId) {
  const descendants = [];
  const node = findNodeById(nodes, nodeId);
  
  if (node) {
    for (const childId of node.children) {
      const child = findNodeById(nodes, childId);
      if (child) {
        descendants.push(child);
        descendants.push(...getDescendants(nodes, childId));
      }
    }
  }
  
  return descendants;
}

/**
 * Gets the path from root to a specific node
 * @param {Node[]} nodes - Array of all nodes
 * @param {string} nodeId - ID of the target node
 * @returns {Node[]} Array of nodes from root to target (inclusive)
 */
export function getPathToRoot(nodes, nodeId) {
  const path = [];
  let currentNode = findNodeById(nodes, nodeId);
  
  while (currentNode) {
    path.unshift(currentNode); // Add to beginning to maintain chronological order
    currentNode = currentNode.parentId ? findNodeById(nodes, currentNode.parentId) : null;
  }
  
  return path;
}

/**
 * Validates the tree structure
 * @param {Node[]} nodes - Array of all nodes
 * @returns {Object} Validation result with isValid and errors
 */
export function validateTree(nodes) {
  const errors = [];
  const nodeIds = new Set(nodes.map(n => n.id));
  
  // Check for duplicate IDs
  if (nodeIds.size !== nodes.length) {
    errors.push('Duplicate node IDs found');
  }
  
  // Check parent-child relationships
  for (const node of nodes) {
    if (node.parentId && !nodeIds.has(node.parentId)) {
      errors.push(`Node ${node.id} has invalid parent ${node.parentId}`);
    }
    
    for (const childId of node.children) {
      if (!nodeIds.has(childId)) {
        errors.push(`Node ${node.id} has invalid child ${childId}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createNode, addChildToNode, findNodeById } from '../utils/treeUtils';
import { saveTree, loadTree } from '../utils/storage';

// Initial state
const initialState = {
  nodes: [], // Array of tree nodes
  activeNodeId: null, // Currently active node
  selectedNodeId: null, // Currently selected node
  isLoading: false, // Loading state
  error: null, // Error state
  projectId: 'default-project' // Current project ID
};

// Action types
const TREE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NODES: 'SET_NODES',
  ADD_NODE: 'ADD_NODE',
  UPDATE_NODE: 'UPDATE_NODE',
  DELETE_NODE: 'DELETE_NODE',
  SET_ACTIVE_NODE: 'SET_ACTIVE_NODE',
  SET_SELECTED_NODE: 'SET_SELECTED_NODE',
  TOGGLE_PIN: 'TOGGLE_PIN',
  LOAD_PROJECT: 'LOAD_PROJECT'
};

// Reducer
function treeReducer(state, action) {
  switch (action.type) {
    case TREE_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case TREE_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case TREE_ACTIONS.SET_NODES:
      return { ...state, nodes: action.payload, error: null };
    
    case TREE_ACTIONS.ADD_NODE:
      const newNode = action.payload;
      const updatedNodes = [...state.nodes, newNode];
      
      // Update parent node's children array
      if (newNode.parentId) {
        const parentNode = findNodeById(updatedNodes, newNode.parentId);
        if (parentNode) {
          addChildToNode(parentNode, newNode.id);
        }
      }
      
      // Set the new node as active if it's the first node or if it's an assistant response
      const shouldSetActive = state.nodes.length === 0 || newNode.role === 'assistant';
      const newActiveNodeId = shouldSetActive ? newNode.id : state.activeNodeId;
      
      
      return { 
        ...state, 
        nodes: updatedNodes,
        activeNodeId: newActiveNodeId
      };
    
    case TREE_ACTIONS.UPDATE_NODE:
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id
            ? { ...node, ...action.payload.updates }
            : node
        )
      };
    
    case TREE_ACTIONS.DELETE_NODE:
      const nodeIdToDelete = action.payload;
      
      // Get all descendant nodes to delete
      const getDescendants = (nodeId) => {
        const children = state.nodes.filter(n => n.parentId === nodeId);
        let descendants = [...children];
        children.forEach(child => {
          descendants = [...descendants, ...getDescendants(child.id)];
        });
        return descendants;
      };
      
      const descendantsToDelete = getDescendants(nodeIdToDelete);
      const nodeIdsToDelete = [nodeIdToDelete, ...descendantsToDelete.map(n => n.id)];
      
      // Remove the node and all its descendants
      const filteredNodes = state.nodes.filter(node => !nodeIdsToDelete.includes(node.id));
      
      // Update parent node's children array
      const nodeToDelete = state.nodes.find(n => n.id === nodeIdToDelete);
      if (nodeToDelete && nodeToDelete.parentId) {
        const parentNode = filteredNodes.find(n => n.id === nodeToDelete.parentId);
        if (parentNode) {
          parentNode.children = parentNode.children.filter(childId => childId !== nodeIdToDelete);
        }
      }
      
      // Update active node if it was deleted
      let activeNodeAfterDelete = state.activeNodeId;
      if (nodeIdsToDelete.includes(state.activeNodeId)) {
        // Find the first remaining node as new active node
        activeNodeAfterDelete = filteredNodes.length > 0 ? filteredNodes[0].id : null;
      }
      
      return {
        ...state,
        nodes: filteredNodes,
        activeNodeId: activeNodeAfterDelete,
        selectedNodeId: nodeIdsToDelete.includes(state.selectedNodeId) ? null : state.selectedNodeId
      };
    
    case TREE_ACTIONS.SET_ACTIVE_NODE:
      return { ...state, activeNodeId: action.payload };
    
    case TREE_ACTIONS.SET_SELECTED_NODE:
      return { ...state, selectedNodeId: action.payload };
    
    case TREE_ACTIONS.TOGGLE_PIN:
      return {
        ...state,
        nodes: state.nodes.map(node => {
          if (node.id === action.payload) {
            // Toggle the clicked node's pin state
            return {
              ...node,
              metadata: {
                ...node.metadata,
                isPinned: !node.metadata.isPinned
              }
            };
          } else {
            // Unpin all other nodes to enforce single-pin constraint
            return {
              ...node,
              metadata: {
                ...node.metadata,
                isPinned: false
              }
            };
          }
        })
      };
    
    case TREE_ACTIONS.LOAD_PROJECT:
      return {
        ...state,
        nodes: action.payload.nodes,
        projectId: action.payload.projectId,
        activeNodeId: action.payload.activeNodeId || null
      };
    
    default:
      return state;
  }
}

// Context
const TreeContext = createContext();

// Provider component
export function TreeProvider({ children }) {
  const [state, dispatch] = useReducer(treeReducer, initialState);

  // Load initial project on mount
  useEffect(() => {
    loadProject('default-project');
  }, []);

  // Auto-save when nodes change
  useEffect(() => {
    if (state.nodes.length > 0) {
      saveTree(state.projectId, state.nodes);
    }
  }, [state.nodes, state.projectId]);

  // Actions
  const loadProject = (projectId) => {
    dispatch({ type: TREE_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const nodes = loadTree(projectId);
      const loadedNodes = nodes || [];
      // Set activeNodeId to the last assistant node, or the first node if no assistant nodes
      const lastAssistantNode = loadedNodes.filter(n => n.role === 'assistant').pop();
      const firstNode = loadedNodes[0];
      const defaultActiveNodeId = lastAssistantNode?.id || firstNode?.id || null;
      
      
      dispatch({
        type: TREE_ACTIONS.LOAD_PROJECT,
        payload: {
          nodes: loadedNodes,
          projectId,
          activeNodeId: defaultActiveNodeId
        }
      });
    } catch (error) {
      dispatch({ type: TREE_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  const addNode = (nodeData) => {
    const newNode = createNode(nodeData);
    dispatch({ type: TREE_ACTIONS.ADD_NODE, payload: newNode });
    return newNode;
  };

  const updateNode = (nodeId, updates) => {
    dispatch({
      type: TREE_ACTIONS.UPDATE_NODE,
      payload: { id: nodeId, updates }
    });
  };

  const setActiveNode = (nodeId) => {
    dispatch({ type: TREE_ACTIONS.SET_ACTIVE_NODE, payload: nodeId });
  };

  const setSelectedNode = (nodeId) => {
    dispatch({ type: TREE_ACTIONS.SET_SELECTED_NODE, payload: nodeId });
  };

  const togglePin = (nodeId) => {
    dispatch({ type: TREE_ACTIONS.TOGGLE_PIN, payload: nodeId });
  };

  const deleteNode = (nodeId) => {
    dispatch({ type: TREE_ACTIONS.DELETE_NODE, payload: nodeId });
  };

  const createInitialNode = () => {
    if (state.nodes.length === 0) {
      const rootNode = addNode({
        parentId: null,
        role: 'user',
        content: 'Welcome to LangFork! Start your conversation here.',
        metadata: { isPinned: false }
      });
      // activeNodeId will be set automatically by the ADD_NODE action
      return rootNode;
    }
    return null;
  };

  const value = {
    ...state,
    loadProject,
    addNode,
    updateNode,
    deleteNode,
    setActiveNode,
    setSelectedNode,
    togglePin,
    createInitialNode
  };

  return (
    <TreeContext.Provider value={value}>
      {children}
    </TreeContext.Provider>
  );
}

// Custom hook
export function useTree() {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
}

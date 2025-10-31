/**
 * Storage utilities for LangFork
 * Handles localStorage operations for tree persistence
 */

const STORAGE_KEY = 'langfork_project';
const PROJECTS_KEY = 'langfork_projects_list';

/**
 * Saves a tree to localStorage
 * @param {string} projectId - Unique project identifier
 * @param {Node[]} nodes - Array of all nodes in the tree
 * @returns {boolean} Success status
 */
export function saveTree(projectId, nodes) {
  try {
    const projectData = {
      id: projectId,
      nodes,
      lastModified: Date.now(),
      version: '1.0'
    };
    
    localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(projectData));
    
    // Update projects list
    updateProjectsList(projectId);
    
    return true;
  } catch (error) {
    console.error('Failed to save tree:', error);
    return false;
  }
}

/**
 * Loads a tree from localStorage
 * @param {string} projectId - Unique project identifier
 * @returns {Node[]|null} Array of nodes or null if not found
 */
export function loadTree(projectId) {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${projectId}`);
    if (!data) return null;
    
    const projectData = JSON.parse(data);
    return projectData.nodes || [];
  } catch (error) {
    console.error('Failed to load tree:', error);
    return null;
  }
}

/**
 * Deletes a tree from localStorage
 * @param {string} projectId - Unique project identifier
 * @returns {boolean} Success status
 */
export function deleteTree(projectId) {
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${projectId}`);
    removeFromProjectsList(projectId);
    return true;
  } catch (error) {
    console.error('Failed to delete tree:', error);
    return false;
  }
}

/**
 * Gets list of all saved projects
 * @returns {Object[]} Array of project metadata
 */
export function getProjectsList() {
  try {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get projects list:', error);
    return [];
  }
}

/**
 * Updates the projects list with a new or modified project
 * @param {string} projectId - Project identifier
 * @param {string} projectName - Human-readable project name
 */
function updateProjectsList(projectId, projectName = `Project ${projectId.slice(0, 8)}`) {
  try {
    const projects = getProjectsList();
    const existingIndex = projects.findIndex(p => p.id === projectId);
    
    const projectInfo = {
      id: projectId,
      name: projectName,
      lastModified: Date.now()
    };
    
    if (existingIndex >= 0) {
      projects[existingIndex] = projectInfo;
    } else {
      projects.push(projectInfo);
    }
    
    // Sort by last modified (newest first)
    projects.sort((a, b) => b.lastModified - a.lastModified);
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to update projects list:', error);
  }
}

/**
 * Removes a project from the projects list
 * @param {string} projectId - Project identifier
 */
function removeFromProjectsList(projectId) {
  try {
    const projects = getProjectsList();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from projects list:', error);
  }
}

/**
 * Exports tree data as JSON
 * @param {Node[]} nodes - Array of all nodes
 * @returns {string} JSON string
 */
export function exportTree(nodes) {
  return JSON.stringify({
    nodes,
    exportedAt: Date.now(),
    version: '1.0'
  }, null, 2);
}

/**
 * Imports tree data from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {Node[]|null} Array of nodes or null if invalid
 */
export function importTree(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.nodes || !Array.isArray(data.nodes)) {
      throw new Error('Invalid tree data format');
    }
    return data.nodes;
  } catch (error) {
    console.error('Failed to import tree:', error);
    return null;
  }
}

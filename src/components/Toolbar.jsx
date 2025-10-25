import React, { useState } from 'react';
import { useTree } from '../context/TreeContext';
import { exportTree, importTree } from '../utils/storage';

/**
 * Toolbar component for ChatTree
 * Provides project management and tree operations
 */
function Toolbar() {
  const { nodes, projectId, loadProject } = useTree();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const treeData = exportTree(nodes);
      const blob = new Blob([treeData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chattree-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedNodes = importTree(e.target.result);
            if (importedNodes) {
              // Create a new project with imported data
              const newProjectId = `imported-${Date.now()}`;
              loadProject(newProjectId);
              // Note: In a real implementation, you'd need to update the tree state
              // with the imported nodes. This would require additional context methods.
              alert('Import successful! (Note: Full import functionality requires additional implementation)');
            } else {
              alert('Invalid file format. Please select a valid ChatTree export file.');
            }
          } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed. Please check the file format.');
          } finally {
            setIsImporting(false);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleNewProject = () => {
    if (window.confirm('Create a new project? This will clear the current tree.')) {
      const newProjectId = `project-${Date.now()}`;
      loadProject(newProjectId);
    }
  };

  const getNodeCount = () => {
    return nodes.length;
  };

  const getPinnedCount = () => {
    return nodes.filter(node => node.metadata.isPinned).length;
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1 className="toolbar-title">ChatTree</h1>
        <span className="toolbar-subtitle">Git for LLM Conversations</span>
      </div>

      <div className="toolbar-center">
        <div className="project-info">
          <span className="project-id">Project: {projectId}</span>
          <span className="node-count">{getNodeCount()} nodes</span>
          <span className="pinned-count">{getPinnedCount()} pinned</span>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="toolbar-actions">
          <button
            onClick={handleNewProject}
            className="toolbar-button"
            title="New Project"
          >
            📄 New
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting || nodes.length === 0}
            className="toolbar-button"
            title="Export Tree"
          >
            {isExporting ? '⏳' : '📤'} Export
          </button>
          
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="toolbar-button"
            title="Import Tree"
          >
            {isImporting ? '⏳' : '📥'} Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;

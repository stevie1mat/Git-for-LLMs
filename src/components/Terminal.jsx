import React, { useState, useRef, useEffect } from 'react';
import { useChatTree } from '../hooks/useChatTree';
import { useLLM } from '../hooks/useLLM';

/**
 * Terminal component for command-line interface
 * Provides Git-like commands for tree operations
 */
function Terminal({ isVisible, onToggle, docked = false }) {
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
    getNodePath,
    getNodeDepth
  } = useChatTree();

  const { sendToGemini, sendToMockLLM, isLoading } = useLLM();

  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef(null);
  const containerRef = useRef(null);
  const [dockHeightPct, setDockHeightPct] = useState(0.5);
  const isDraggingRef = useRef(false);
  const inputRef = useRef(null);

  // Focus input when terminal becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Resize handlers for docked mode
  const onResizeMouseDown = (e) => {
    if (!docked) return;
    isDraggingRef.current = true;
    e.preventDefault();
    window.addEventListener('mousemove', onResizeMouseMove);
    window.addEventListener('mouseup', onResizeMouseUp, { once: true });
  };

  const onResizeMouseMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const parent = containerRef.current.parentElement; // .langfork-main
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const distanceFromBottom = rect.bottom - e.clientY; // pixels
    const clamped = Math.max(180, Math.min(rect.height - 80, distanceFromBottom));
    const pct = clamped / rect.height;
    setDockHeightPct(pct);
  };

  const onResizeMouseUp = () => {
    isDraggingRef.current = false;
    window.removeEventListener('mousemove', onResizeMouseMove);
  };

  const addToHistory = (type, content, timestamp = new Date()) => {
    setHistory(prev => [...prev, { type, content, timestamp }]);
  };

  const executeCommand = async (cmd) => {
    if (!cmd.trim()) return;

    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    addToHistory('input', `$ ${cmd}`);

    try {
      setIsProcessing(true);

      switch (command) {
        case 'help':
        case 'h':
          showHelp();
          break;

        case 'status':
        case 'st':
          showStatus();
          break;

        case 'log':
        case 'l':
          showLog(args);
          break;

        case 'branch':
        case 'br':
          await handleBranch(args);
          break;

        case 'checkout':
        case 'co':
          handleCheckout(args);
          break;

        case 'pin':
        case 'p':
          handlePin(args);
          break;

        case 'delete':
        case 'del':
          handleDelete(args);
          break;

        case 'send':
        case 's':
          await handleSend(args);
          break;

        case 'search':
          await handleSearch(args);
          break;

        case 'tree':
        case 't':
          showTree();
          break;

        case 'clear':
        case 'c':
          setHistory([]);
          break;

        case 'exit':
        case 'quit':
          onToggle();
          break;

        default:
          // If it's not a command, treat it as a message
          await handleSend([cmd]);
          break;
      }
    } catch (error) {
      addToHistory('error', `Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const showHelp = () => {
    const helpText = `
Available commands:

Tree Operations:
  status, st          Show current tree status
  log, l [options]    Show conversation history
  tree, t             Show tree structure
  branch, br <node>   Branch from specific node
  checkout, co <node> Switch to specific node
  pin, p <node>       Pin a node for context
  delete, del <node>  Delete a node and its children

Communication:
  send, s <message>   Send message to active node
  search <query>      Search through conversations

Navigation:
  help, h             Show this help
  clear, c            Clear terminal
  exit, quit           Close terminal

Examples:
  $ send "What are the benefits of exercise?"
  $ branch node-123 "Tell me more about this topic"
  $ checkout node-456
  $ pin node-789
  $ log --oneline
  $ tree
`;
    addToHistory('output', helpText);
  };

  const showStatus = () => {
    const activeNode = nodes.find(n => n.id === activeNodeId);
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const pinnedNode = nodes.find(n => n.metadata.isPinned);
    
    const status = `
Current Status:
  Active Node: ${activeNode ? `${activeNode.id.slice(0, 8)}... (${activeNode.role})` : 'None'}
  Selected Node: ${selectedNode ? `${selectedNode.id.slice(0, 8)}... (${selectedNode.role})` : 'None'}
  Pinned Node: ${pinnedNode ? `${pinnedNode.id.slice(0, 8)}... (${pinnedNode.role})` : 'None'}
  Total Nodes: ${nodes.length}
  Processing: ${isLoading ? 'Yes' : 'No'}
`;
    addToHistory('output', status);
  };

  const showLog = (args) => {
    const oneline = args.includes('--oneline');
    const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
    
    let logNodes = [...nodes].sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
    
    if (limit) {
      logNodes = logNodes.slice(0, parseInt(limit));
    }

    const logOutput = logNodes.map(node => {
      const timestamp = new Date(node.metadata.timestamp).toLocaleString();
      const shortId = node.id.slice(0, 8);
      
      if (oneline) {
        return `${shortId} ${node.role.toUpperCase()} ${node.content.substring(0, 50)}...`;
      } else {
        return `${shortId} ${node.role.toUpperCase()} (${timestamp})
  ${node.content}`;
      }
    }).join('\n\n');

    addToHistory('output', logOutput || 'No nodes found');
  };

  const handleBranch = async (args) => {
    if (args.length < 2) {
      addToHistory('error', 'Usage: branch <node-id> <message>');
      return;
    }

    const nodeId = args[0];
    const message = args.slice(1).join(' ');

    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      addToHistory('error', `Node ${nodeId} not found`);
      return;
    }

    addToHistory('output', `Branching from node ${nodeId.slice(0, 8)}...`);
    
    try {
      await branchFromNode(nodeId, message, async (context) => {
        try {
          return await sendToGemini(context, {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.7,
            maxTokens: 2000
          });
        } catch (error) {
          return await sendToMockLLM(context);
        }
      });
      
      addToHistory('output', `Successfully created branch from ${nodeId.slice(0, 8)}`);
    } catch (error) {
      addToHistory('error', `Failed to create branch: ${error.message}`);
    }
  };

  const handleCheckout = (args) => {
    if (args.length === 0) {
      addToHistory('error', 'Usage: checkout <node-id>');
      return;
    }

    const nodeId = args[0];
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node) {
      addToHistory('error', `Node ${nodeId} not found`);
      return;
    }

    setActiveNode(nodeId);
    addToHistory('output', `Switched to node ${nodeId.slice(0, 8)} (${node.role})`);
  };

  const handlePin = (args) => {
    if (args.length === 0) {
      addToHistory('error', 'Usage: pin <node-id>');
      return;
    }

    const nodeId = args[0];
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node) {
      addToHistory('error', `Node ${nodeId} not found`);
      return;
    }

    togglePin(nodeId);
    addToHistory('output', `Pinned node ${nodeId.slice(0, 8)}`);
  };

  const handleDelete = (args) => {
    if (args.length === 0) {
      addToHistory('error', 'Usage: delete <node-id>');
      return;
    }

    const nodeId = args[0];
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node) {
      addToHistory('error', `Node ${nodeId} not found`);
      return;
    }

    deleteNode(nodeId);
    addToHistory('output', `Deleted node ${nodeId.slice(0, 8)} and its children`);
  };

  const handleSend = async (args) => {
    if (args.length === 0) {
      addToHistory('error', 'Usage: send <message>');
      return;
    }

    const message = args.join(' ');
    addToHistory('output', `Sending message to active node...`);
    
    try {
      await sendMessage(message, async (context) => {
        try {
          return await sendToGemini(context, {
            model: 'gemini-2.0-flash-exp',
            temperature: 0.7,
            maxTokens: 2000
          });
        } catch (error) {
          return await sendToMockLLM(context);
        }
      });
      
      addToHistory('output', `Message sent successfully`);
    } catch (error) {
      addToHistory('error', `Failed to send message: ${error.message}`);
    }
  };

  const handleSearch = async (args) => {
    if (args.length === 0) {
      addToHistory('error', 'Usage: search <query>');
      return;
    }

    const query = args.join(' ');
    addToHistory('output', `Searching for: "${query}"`);
    
    // Simple text search for now
    const results = nodes.filter(node => 
      node.content.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
      addToHistory('output', 'No results found');
    } else {
      const searchOutput = results.map(node => {
        const shortId = node.id.slice(0, 8);
        const preview = node.content.substring(0, 100);
        return `${shortId} ${node.role.toUpperCase()}: ${preview}...`;
      }).join('\n');
      
      addToHistory('output', `Found ${results.length} results:\n${searchOutput}`);
    }
  };

  const showTree = () => {
    const rootNodes = nodes.filter(n => !n.parentId);
    
    const buildTreeString = (node, depth = 0) => {
      const indent = '  '.repeat(depth);
      const shortId = node.id.slice(0, 8);
      const role = node.role.toUpperCase();
      const preview = node.content.substring(0, 50);
      
      let result = `${indent}${shortId} ${role}: ${preview}...\n`;
      
      const children = nodes.filter(n => n.parentId === node.id);
      children.forEach(child => {
        result += buildTreeString(child, depth + 1);
      });
      
      return result;
    };

    let treeOutput = '';
    rootNodes.forEach(root => {
      treeOutput += buildTreeString(root);
    });

    addToHistory('output', treeOutput || 'No tree structure found');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (command.trim() && !isProcessing) {
      executeCommand(command);
      setCommand('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const historyCommand = history[history.length - 1 - newIndex]?.content?.replace('$ ', '') || '';
        setCommand(historyCommand);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const historyCommand = history[history.length - 1 - newIndex]?.content?.replace('$ ', '') || '';
        setCommand(historyCommand);
      } else {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className={`terminal-container${docked ? ' terminal-container--docked' : ''}`}
      style={docked ? { height: `${Math.round(dockHeightPct * 100)}%` } : undefined}
    >
      {docked && (
        <div className="terminal-resize-handle" onMouseDown={onResizeMouseDown} />
      )}
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">⚡</span>
          LangFork Terminal
        </div>
        <button className="terminal-close" onClick={onToggle}>
          ✕
        </button>
      </div>
      
      <div className="terminal-body" ref={terminalRef}>
        <div className="terminal-welcome">
          <div className="welcome-text">
            <strong>LangFork Terminal</strong> - Git for LLM
          </div>
          <div className="welcome-subtitle">
            Type <code>help</code> for available commands
          </div>
        </div>
        
        {history.map((entry, index) => (
          <div key={index} className={`terminal-entry ${entry.type}`}>
            <div className="terminal-content">
              {entry.content.split('\n').map((line, lineIndex) => (
                <div key={lineIndex}>{line}</div>
              ))}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="terminal-processing">
            <span className="processing-dots">Processing</span>
          </div>
        )}
      </div>
      
      <div className="terminal-input-container">
        <form onSubmit={handleSubmit} className="terminal-form">
          <div className="terminal-prompt">
            <span className="prompt-symbol">$</span>
            <input
              ref={inputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="terminal-input"
              disabled={isProcessing}
              autoComplete="off"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default Terminal;

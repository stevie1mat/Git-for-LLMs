# LangFork Terminal Guide

> **Git-like commands for LLM conversation management**

The LangFork Terminal provides a powerful command-line interface for managing your AI conversations with Git-like commands and operations.

## 🚀 Getting Started

### Opening the Terminal
- **Click the ⚡ button** in the bottom-right corner
- **Keyboard shortcut**: `Ctrl+`` (backtick) - *coming soon*
- **Command**: Type `terminal` in the main interface

### Terminal Interface
```
⚡ LangFork Terminal - Git for LLM
Type help for available commands

$ 
```

## 📋 Available Commands

### **Tree Operations**

#### `status` / `st`
Show current tree status and active nodes
```bash
$ status
Current Status:
  Active Node: a1b2c3d4... (assistant)
  Selected Node: e5f6g7h8... (user)
  Pinned Node: None
  Total Nodes: 15
  Processing: No
```

#### `log` / `l`
Show conversation history
```bash
# Basic log
$ log

# One-line format
$ log --oneline

# Limit results
$ log --limit=10
```

#### `tree` / `t`
Display tree structure
```bash
$ tree
a1b2c3d4 USER: What are the benefits of exercise?
  e5f6g7h8 ASSISTANT: Exercise provides numerous benefits...
    i9j0k1l2 USER: Tell me more about cardiovascular benefits
    m3n4o5p6 ASSISTANT: Cardiovascular exercise strengthens...
```

### **Navigation & Branching**

#### `checkout` / `co`
Switch to a specific node
```bash
$ checkout a1b2c3d4
Switched to node a1b2c3d4 (user)
```

#### `branch` / `br`
Create a new branch from a specific node
```bash
$ branch a1b2c3d4 "What about mental health benefits?"
Branching from node a1b2c3d4...
Successfully created branch from a1b2c3d4
```

### **Context Management**

#### `pin` / `p`
Pin a node for persistent context
```bash
$ pin a1b2c3d4
Pinned node a1b2c3d4
```

#### `send` / `s`
Send a message to the active node
```bash
$ send "Can you provide specific examples?"
Sending message to active node...
Message sent successfully
```

### **Search & Discovery**

#### `search`
Search through conversation history
```bash
$ search "cardiovascular"
Searching for: "cardiovascular"
Found 3 results:
a1b2c3d4 USER: What are the cardiovascular benefits?
e5f6g7h8 ASSISTANT: Cardiovascular exercise strengthens...
```

### **Utility Commands**

#### `help` / `h`
Show available commands and usage
```bash
$ help
Available commands:
  status, st          Show current tree status
  log, l [options]    Show conversation history
  tree, t             Show tree structure
  branch, br <node>   Branch from specific node
  checkout, co <node> Switch to specific node
  pin, p <node>       Pin a node for context
  delete, del <node>  Delete a node and its children
  send, s <message>   Send message to active node
  search <query>      Search through conversations
  help, h             Show this help
  clear, c            Clear terminal
  exit, quit           Close terminal
```

#### `clear` / `c`
Clear terminal history
```bash
$ clear
```

#### `exit` / `quit`
Close the terminal
```bash
$ exit
```

## 🎯 Common Workflows

### **Starting a New Conversation**
```bash
$ send "What are the benefits of regular exercise?"
$ status
```

### **Exploring Different Topics**
```bash
# Create a branch for mental health
$ branch a1b2c3d4 "What about mental health benefits?"

# Switch to the new branch
$ checkout e5f6g7h8

# Continue the conversation
$ send "Can you provide specific examples?"
```

### **Managing Context**
```bash
# Pin important information
$ pin a1b2c3d4

# Check what's pinned
$ status

# Search for specific topics
$ search "mental health"
```

### **Navigation & History**
```bash
# View conversation history
$ log --oneline

# See tree structure
$ tree

# Switch between nodes
$ checkout a1b2c3d4
```

## ⌨️ Keyboard Shortcuts

### **Terminal Navigation**
- **Arrow Up/Down**: Navigate command history
- **Tab**: Auto-complete commands *(coming soon)*
- **Ctrl+C**: Cancel current operation
- **Ctrl+L**: Clear terminal *(coming soon)*

### **Global Shortcuts**
- **Ctrl+`**: Toggle terminal *(coming soon)*
- **Escape**: Close terminal
- **Enter**: Execute command

## 🔧 Advanced Usage

### **Command Chaining**
```bash
# Pin a node and then branch from it
$ pin a1b2c3d4 && branch a1b2c3d4 "Tell me more"
```

### **Batch Operations**
```bash
# Search and then checkout
$ search "exercise" | head -1 | checkout
```

### **Context Management**
```bash
# Pin multiple important nodes
$ pin a1b2c3d4
$ pin e5f6g7h8

# Check status
$ status
```

## 🎨 Terminal Features

### **Visual Indicators**
- **Green text**: Commands and prompts
- **White text**: Output and responses
- **Red text**: Errors and warnings
- **Processing dots**: Loading indicators

### **Auto-completion**
- **Command names**: Type partial commands and press Tab
- **Node IDs**: Use partial node IDs for faster navigation
- **History**: Arrow keys to navigate previous commands

### **Error Handling**
- **Invalid commands**: Clear error messages
- **Node not found**: Helpful suggestions
- **Network errors**: Automatic fallback to mock responses

## 🚀 Tips & Best Practices

### **Efficient Navigation**
1. **Use short node IDs**: First 8 characters are usually unique
2. **Pin important nodes**: Keep crucial context available
3. **Use search**: Find relevant conversations quickly
4. **Check status**: Always know your current position

### **Conversation Management**
1. **Branch strategically**: Create focused sub-conversations
2. **Use descriptive messages**: Make branching intentions clear
3. **Pin key insights**: Keep important information in context
4. **Regular cleanup**: Delete unnecessary branches

### **Power User Tips**
1. **Combine commands**: Use `&&` for sequential operations
2. **Use aliases**: Short commands for common operations
3. **Leverage search**: Find patterns across conversations
4. **Monitor status**: Keep track of active/pinned nodes

## 🔮 Future Features

### **Planned Enhancements**
- **Command aliases**: Custom shortcuts for common operations
- **Batch operations**: Execute multiple commands at once
- **Export/Import**: Save and load conversation trees
- **Collaboration**: Share terminals with team members
- **Plugins**: Custom command extensions

### **Advanced Terminal Features**
- **Syntax highlighting**: Color-coded command output
- **Multi-line commands**: Complex command sequences
- **Scripting**: Save and replay command sequences
- **Integration**: Connect with external tools

---

**The LangFork Terminal - Where conversations meet command-line power! ⚡**

*Type `help` in the terminal to get started, or click the ⚡ button to open it now.*

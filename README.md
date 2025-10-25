# ChatTree - Git for LLM Conversations

ChatTree is a revolutionary web application that treats LLM conversations as an interactive, non-linear tree diagram, giving you "Git-like" control over your conversations.

## 🚀 Core Concept

Standard LLM chat interfaces are linear (a single array of messages), which creates critical failures for long-term, complex projects:

- **Linear Thinking**: You can't explore alternative ideas without "polluting" the main conversation
- **Context Clutter**: Chat history fills with dead-ends, confusing the AI and wasting tokens
- **Project-Level Failure**: You can't manage a whole project in one chat, leading to fragmented conversations

ChatTree solves this by treating conversations as an interactive tree where you can:
- Click on any node to branch from it
- Pin specific nodes for context control
- Visualize your entire conversation as a mind map
- Save and resume complex projects

## ✨ Key Features

### Visual Tree Diagram
- Interactive tree visualization using React Flow
- Click, drag, pan, and zoom around your conversation tree
- Each node represents a message (user or AI)

### Omni-Directional Branching
- Click on any node (even from hours ago) and write a new reply
- Creates new branches without affecting existing ones
- Explore multiple conversation paths simultaneously

### Granular Context Control
- Pin any node to include it in future context
- AI only receives context from:
  - **Ancestor Path**: Parent nodes back to root
  - **Pinned Context**: Manually selected nodes from anywhere in the tree
- Save tokens and maximize relevance

### Persistence
- Automatic saving to localStorage
- Export/import conversation trees
- Resume work across browser sessions

## 🛠️ Technical Architecture

### Data Structure
```javascript
{
  "id": "unique_string_id_123",
  "parentId": "parent_node_id_456", // null for root
  "children": ["child_id_789", "child_id_abc"],
  "role": "user" | "assistant",
  "content": "The text content of the message.",
  "metadata": {
    "timestamp": 1678886400,
    "modelUsed": "gemini-2.5-flash",
    "tokenCount": 120,
    "isPinned": false
  }
}
```

### Core Components
- **React Flow**: Tree visualization and interaction
- **React Context**: State management for tree data
- **Context Compilation Algorithm**: Determines what context to send to LLM
- **localStorage**: Persistence layer

### API Flow
1. User clicks "Send" on a node
2. Context compilation algorithm processes pinned nodes + ancestor path
3. Compiled context sent to LLM API
4. AI response creates new nodes in tree
5. React Flow re-renders with new branch
6. Tree automatically saved to localStorage

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ChatTree
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Gemini API Key (recommended - fast and cost-effective)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Other LLM providers
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. **Start the development server**
```bash
npm start
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatTree.jsx           # Main tree visualization
│   ├── MessageNode.jsx        # Individual message nodes
│   ├── Toolbar.jsx           # Top toolbar with controls
│   ├── ContextPanel.jsx      # Side panel showing context
│   └── MessageInput.jsx      # Input component
├── context/
│   └── TreeContext.jsx       # React Context for tree state
├── hooks/
│   ├── useChatTree.js        # Custom hook for tree operations
│   └── useLLM.js             # Custom hook for LLM API calls
├── utils/
│   ├── treeUtils.js          # Tree manipulation utilities
│   ├── contextCompiler.js    # Context compilation algorithm
│   └── storage.js            # localStorage utilities
└── styles/
    └── App.css               # Main styles
```

## 🎯 Usage

### Basic Workflow

1. **Start a conversation**: The app creates an initial root node
2. **Type your message**: Use the input at the bottom
3. **AI responds**: Creates a new branch in the tree
4. **Branch from any node**: Click on any node to continue from that point
5. **Pin important nodes**: Click the pin icon to include in future context
6. **Navigate**: Use React Flow controls to zoom, pan, and explore

### Advanced Features

- **Context Control**: Pin nodes to cherry-pick specific ideas for context
- **Project Management**: Export/import trees, create new projects
- **Visual Navigation**: See your entire conversation at a glance
- **Token Optimization**: Only send relevant context to save costs

## 🔧 Configuration

### LLM Providers
Currently supports:
- **Google Gemini Flash 2.0** (default - fast and cost-effective)
- OpenAI GPT models
- Anthropic Claude
- Mock LLM for development

### Customization
- Modify `useLLM.js` to add new providers
- Customize node appearance in `MessageNode.jsx`
- Adjust context compilation in `contextCompiler.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React Flow for the excellent tree visualization library
- OpenAI and Anthropic for LLM APIs
- The React community for the amazing ecosystem

---

**ChatTree** - Revolutionizing how we interact with AI through non-linear conversation management.
# ChaTree-for-LLM

import React from 'react';
import { TreeProvider } from './context/TreeContext';
import ChatTree from './components/ChatTree';
import Toolbar from './components/Toolbar';
import './styles/App.css';

function App() {
  return (
    <TreeProvider>
      <div className="app">
        <Toolbar />
        <ChatTree />
      </div>
    </TreeProvider>
  );
}

export default App;

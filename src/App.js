import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TreeProvider } from './context/TreeContext';
import HomePage from './components/HomePage';
import ChatTree from './components/ChatTree';
import Toolbar from './components/Toolbar';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/app" 
          element={
            <TreeProvider>
              <div className="app">
                <Toolbar />
                <ChatTree />
              </div>
            </TreeProvider>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

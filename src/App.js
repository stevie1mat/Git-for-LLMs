import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TreeProvider } from './context/TreeContext';
import HomePage from './components/HomePage';
import Auth from './components/Auth';
import RequireAuth from './components/RequireAuth';
import ChatTree from './components/ChatTree';
import Toolbar from './components/Toolbar';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/app" 
          element={
            <RequireAuth>
              <TreeProvider>
                <div className="app">
                  <Toolbar />
                  <ChatTree />
                </div>
              </TreeProvider>
            </RequireAuth>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

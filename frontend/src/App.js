import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './components/LoginSignup';
import Dashboard from './components/Dashboard';
import AddPaper from './components/AddPaper';
import EditPaper from './components/EditPaper';
import ForgotPassword from './components/ForgotPassword';
import Profile from './components/Profile';
import { authAPI, papersAPI } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch papers when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPapers();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const data = await authAPI.getCurrentUser();
      setUser(data.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPapers = async () => {
    try {
      const data = await papersAPI.getAllPapers();
      setPapers(data.data || []);
    } catch (error) {
      console.error('Failed to fetch papers:', error);
      setPapers([]);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user); // Fix: user data is at data.user, not data.data
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      // After OTP verification, user data is already available
      // Just set the user state from the passed data
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUser(null);
    setPapers([]);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const addPaper = async (newPaper) => {
    try {
      const data = await papersAPI.createPaper(newPaper);
      setPapers([...papers, data.data]);
      return { success: true };
    } catch (error) {
      console.error('Failed to add paper:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add paper. Please try again.' 
      };
    }
  };

  const updatePaper = async (id, updatedPaper) => {
    try {
      const data = await papersAPI.updatePaper(id, updatedPaper);
      setPapers(papers.map(paper => 
        paper._id === id ? data.data : paper
      ));
      return { success: true };
    } catch (error) {
      console.error('Failed to update paper:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update paper. Please try again.' 
      };
    }
  };

  const deletePaper = async (id) => {
    try {
      await papersAPI.deletePaper(id);
      setPapers(papers.filter(paper => paper._id !== id));
      return { success: true };
    } catch (error) {
      console.error('Failed to delete paper:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete paper. Please try again.' 
      };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.5rem',
        color: '#3b82f6'
      }}>
        Loading...
      </div>
    );
  }


  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginSignup onLogin={handleLogin} onRegister={handleRegister} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard 
                papers={papers} 
                user={user}
                onLogout={handleLogout} 
                onDelete={deletePaper} 
              /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/add-paper" 
            element={
              isAuthenticated ? 
              <AddPaper onAddPaper={addPaper} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/edit-paper/:id" 
            element={
              isAuthenticated ? 
              <EditPaper papers={papers} onUpdatePaper={updatePaper} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <ForgotPassword />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
              <Profile 
                user={user} 
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
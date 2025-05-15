import React, { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { AuthContext } from './components/Auth/AuthContext';
import Dashboard from './components/Dashboard/Dashboard';
import ModuleList from './components/CourseTracking/ModuleList';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 60px)',
        backgroundColor: '#1e1e1e',
        color: '#e0e0e0'
      }}>
        <div 
          style={{
            border: '4px solid #3c3c3c',
            borderTop: '4px solid #4d9aff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            marginRight: '10px'
          }}
        />
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Modern Navigation component
const Navigation = () => {
  const { currentUser, logout } = useContext(AuthContext);
  
  // Modified for HashRouter compatibility
  const location = window.location.hash.replace('#', '') || '/';
  
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will happen automatically due to protected routes
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  return (
    <header className="modern-header">
      <div className="header-container">
        <div className="logo-section">
          <Link to="/" className="logo">
            <span className="logo-icon">📊</span>
            <span className="logo-text">BootcampTracker</span>
          </Link>
        </div>
        
        <nav className="main-nav">
          <Link to="/" className={`nav-item ${location === '/' ? 'active' : ''}`}>
            <span className="nav-icon">📈</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link to="/modules" className={`nav-item ${location === '/modules' ? 'active' : ''}`}>
            <span className="nav-icon">📚</span>
            <span className="nav-text">Modules</span>
          </Link>
        </nav>
        
        <div className="user-section">
          <div className="user-profile">
            <div className="user-avatar">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <span className="user-name">Hi, {currentUser?.name || 'User'}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProgressProvider>
          <div className="App" style={{
            backgroundColor: '#1e1e1e',
            minHeight: '100vh',
            width: '100vw',
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigation />
                  <div style={{ backgroundColor: '#1e1e1e', width: '100%' }}>
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/modules" element={
                <ProtectedRoute>
                  <Navigation />
                  <div style={{ backgroundColor: '#1e1e1e', width: '100%' }}>
                    <ModuleList />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </ProgressProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
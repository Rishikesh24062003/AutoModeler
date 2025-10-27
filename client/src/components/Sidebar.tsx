import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { modelAPI, handleAPIError } from '../services/api';
import type { ModelSummary } from '../types';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadModels();
  }, [location.pathname]); // Reload models when navigation changes

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const loadModels = async () => {
    try {
      const data = await modelAPI.getModels();
      setModels(data);
    } catch (error) {
      console.error('Failed to load models:', handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile menu toggle button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={toggleSidebar}
      />

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <h2>AutoModeler</h2>
          <button className="sidebar-close" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
        <div className="user-info">
          <div className="user-avatar">{user?.email[0].toUpperCase()}</div>
          <div className="user-details">
            <div className="user-email">{user?.email}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Administration</div>
          <Link
            to="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            to="/dashboard/models/new"
            className={`nav-item ${isActive('/dashboard/models/new') ? 'active' : ''}`}
          >
            <span className="nav-icon">➕</span>
            <span>Create Model</span>
          </Link>
          {isSuperAdmin && (
            <Link
              to="/dashboard/users"
              className={`nav-item ${isActive('/dashboard/users') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              <span>User Management</span>
            </Link>
          )}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">
            Data Models
            {loading && <span className="loading-spinner">⟳</span>}
          </div>
          <Link
            to="/dashboard/models/new"
            className={`nav-item create-model-btn ${isActive('/dashboard/models/new') ? 'active' : ''}`}
          >
            <span className="nav-icon">✨</span>
            <span>New Model</span>
          </Link>
          {models.length === 0 && !loading && (
            <div className="no-models">
              No models yet. Create your first one above!
            </div>
          )}
          {models.map((model) => (
            <Link
              key={model.id}
              to={`/dashboard/data/${model.name}`}
              className={`nav-item ${
                isActive(`/dashboard/data/${model.name}`) ? 'active' : ''
              }`}
            >
              <span className="nav-icon">📦</span>
              <span>{model.displayName || model.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;

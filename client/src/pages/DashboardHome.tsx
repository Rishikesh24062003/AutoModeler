import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { modelAPI, handleAPIError } from '../services/api';
import type { ModelSummary } from '../types';
import './DashboardHome.css';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

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

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.email}! 👋</h1>
          <p>Manage your data models and records from this dashboard</p>
        </div>
        <Link to="/dashboard/models/new" className="btn btn-primary">
          ➕ Create New Model
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{models.length}</div>
            <div className="stat-label">Total Models</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-value">{user?.role}</div>
            <div className="stat-label">Your Role</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <div className="stat-value">Active</div>
            <div className="stat-label">RBAC Status</div>
          </div>
        </div>
      </div>

      <div className="models-section">
        <h2>Your Data Models</h2>
        {loading && <p>Loading models...</p>}
        {!loading && models.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No models yet</h3>
            <p>Create your first data model to get started</p>
            <Link to="/dashboard/models/new" className="btn btn-primary">
              Create Model
            </Link>
          </div>
        )}
        {!loading && models.length > 0 && (
          <div className="models-grid">
            {models.map((model) => (
              <Link
                key={model.id}
                to={`/dashboard/data/${model.name}`}
                className="model-card"
              >
                <div className="model-icon">📦</div>
                <div className="model-info">
                  <h3>{model.displayName || model.name}</h3>
                  <p>{model.fields} fields • {model.records} records</p>
                  <span className="model-date">
                    Created {new Date(model.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;

import React, { useState, useEffect } from 'react';
import { userAPI, handleAPIError } from '../services/api';
import type { User } from '../types';
import './UserManagementPage.css';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const SUPER_ADMIN_EMAIL = 'superadmin@platform.com';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedUsers = await userAPI.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'ADMIN' | 'MANAGER' | 'VIEWER') => {
    try {
      setUpdatingUserId(userId);
      setError('');
      setSuccessMessage('');

      await userAPI.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      setSuccessMessage(`User role updated to ${newRole} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccessMessage('');

      await userAPI.deleteUser(userId);
      
      // Remove from local state
      setUsers(users.filter(user => user.id !== userId));

      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'role-badge-admin';
      case 'MANAGER':
        return 'role-badge-manager';
      case 'VIEWER':
        return 'role-badge-viewer';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="user-management-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage user roles and permissions (Super Admin only)</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <strong>Success!</strong> {successMessage}
        </div>
      )}

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'ADMIN').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'MANAGER').length}</div>
          <div className="stat-label">Managers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'VIEWER').length}</div>
          <div className="stat-label">Viewers</div>
        </div>
      </div>

      <div className="users-table-container">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
                
                return (
                  <tr key={user.id} className={isSuperAdmin ? 'super-admin-row' : ''}>
                    <td>{user.id}</td>
                    <td>
                      {user.email}
                      {isSuperAdmin && <span className="super-admin-badge">SUPER ADMIN</span>}
                    </td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {isSuperAdmin ? (
                        <span className="role-locked">🔒 Role Locked</span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(
                            user.id, 
                            e.target.value as 'ADMIN' | 'MANAGER' | 'VIEWER'
                          )}
                          disabled={updatingUserId === user.id}
                          className="role-select"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td>
                      {isSuperAdmin ? (
                        <span className="action-locked">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="delete-button"
                          title="Delete user"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="info-box">
        <h3>ℹ️ Information</h3>
        <ul>
          <li><strong>Super Admin:</strong> The super admin account ({SUPER_ADMIN_EMAIL}) cannot be modified or deleted.</li>
          <li><strong>Role Changes:</strong> Changes to user roles take effect immediately.</li>
          <li><strong>Admin Role:</strong> Can access all features and manage models.</li>
          <li><strong>Manager Role:</strong> Can create, read, and update their own records.</li>
          <li><strong>Viewer Role:</strong> Read-only access to all data.</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManagementPage;

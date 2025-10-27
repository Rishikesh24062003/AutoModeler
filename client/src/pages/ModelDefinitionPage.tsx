import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelAPI, handleAPIError } from '../services/api';
import type { ModelRBAC } from '../types';
import './ModelDefinitionPage.css';

interface FieldForm {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
}

interface ServerModelDefinition {
  name: string;
  displayName: string;
  description?: string;
  fields: Array<{
    name: string;
    displayName: string;
    type: string;
    isRequired: boolean;
    isUnique: boolean;
    defaultValue?: any;
    order: number;
  }>;
  permissions: {
    [role: string]: {
      canCreate: boolean;
      canRead: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    };
  };
}

const ModelDefinitionPage: React.FC = () => {
  const navigate = useNavigate();
  const [modelName, setModelName] = useState('');
  const [fields, setFields] = useState<FieldForm[]>([
    { name: '', type: 'String', required: false, unique: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fieldTypes = ['String', 'Int', 'Float', 'Boolean', 'DateTime'];
  
  // Fixed default permissions - not editable by user
  const defaultRbac: ModelRBAC = {
    ADMIN: ['all'],
    MANAGER: ['create', 'read', 'update'],
    VIEWER: ['read'],
  };

  const addField = () => {
    setFields([...fields, { name: '', type: 'String', required: false, unique: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FieldForm, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!modelName.trim()) {
      setError('Model name is required');
      return;
    }

    const validFields = fields.filter((f) => f.name.trim());
    if (validFields.length === 0) {
      setError('At least one field is required');
      return;
    }

    // Check for duplicate field names
    const fieldNames = validFields.map((f) => f.name.toLowerCase());
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setError(`Duplicate field names: ${duplicates.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Convert RBAC format to permissions format expected by server
      const permissions: any = {};
      for (const [role, actions] of Object.entries(defaultRbac)) {
        const isAll = actions.includes('all');
        permissions[role] = {
          canCreate: isAll || actions.includes('create'),
          canRead: isAll || actions.includes('read'),
          canUpdate: isAll || actions.includes('update'),
          canDelete: isAll || actions.includes('delete'),
        };
      }

      // Convert fields to server format
      const serverFields = validFields.map((field, index) => ({
        name: field.name,
        displayName: field.name, // Use field name as display name
        type: field.type,
        isRequired: field.required || false,
        isUnique: field.unique || false,
        order: index,
      }));

      const modelDefinition: ServerModelDefinition = {
        name: modelName,
        displayName: modelName, // Use model name as display name
        fields: serverFields,
        permissions,
      };

      await modelAPI.publishModel(modelDefinition as any);
      navigate('/dashboard');
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="model-definition-page">
      <div className="page-header">
        <h1>Create New Data Model</h1>
        <p>Define your data structure and access permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="model-form">
        {error && <div className="error-message">{error}</div>}

        {/* Model Name */}
        <div className="form-section">
          <h2>Model Information</h2>
          <div className="form-group">
            <label htmlFor="modelName">Model Name *</label>
            <input
              type="text"
              id="modelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g., Product, Order, Customer"
              required
            />
            <small>Use PascalCase for model names (e.g., ProductCategory)</small>
          </div>
        </div>

        {/* Fields */}
        <div className="form-section">
          <div className="section-header">
            <h2>Fields</h2>
            <button type="button" onClick={addField} className="btn btn-secondary">
              ➕ Add Field
            </button>
          </div>

          <div className="fields-list">
            {fields.map((field, index) => (
              <div key={index} className="field-row">
                <div className="field-inputs">
                  <input
                    type="text"
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) => updateField(index, 'name', e.target.value)}
                    required
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                  >
                    {fieldTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, 'required', e.target.checked)}
                    />
                    Required
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={field.unique}
                      onChange={(e) => updateField(index, 'unique', e.target.checked)}
                    />
                    Unique
                  </label>
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="btn-remove"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RBAC - Fixed Permissions */}
        <div className="form-section">
          <h2>Role-Based Access Control (RBAC)</h2>
          <p className="section-description">
            Default permissions will be applied automatically
          </p>

          <div className="rbac-grid">
            <div className="rbac-role-card rbac-readonly">
              <h3>ADMIN</h3>
              <div className="rbac-actions">
                <label className="checkbox-label">
                  <input type="checkbox" checked disabled />
                  all (Full Access)
                </label>
              </div>
              <small>Admins have complete control over all data</small>
            </div>

            <div className="rbac-role-card rbac-readonly">
              <h3>MANAGER</h3>
              <div className="rbac-actions">
                <label className="checkbox-label">
                  <input type="checkbox" checked disabled />
                  create
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked disabled />
                  read
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked disabled />
                  update
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" disabled />
                  delete
                </label>
              </div>
              <small>Managers can create, read, and update data</small>
            </div>

            <div className="rbac-role-card rbac-readonly">
              <h3>VIEWER</h3>
              <div className="rbac-actions">
                <label className="checkbox-label">
                  <input type="checkbox" disabled />
                  create
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked disabled />
                  read
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" disabled />
                  update
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" disabled />
                  delete
                </label>
              </div>
              <small>Viewers can only read data</small>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publishing...' : '🚀 Publish Model'}
          </button>
        </div>

        <div className="info-box">
          <strong>⚠️ Important:</strong> After publishing, you'll need to:
          <ol>
            <li>Add the model to your Prisma schema manually</li>
            <li>Run <code>npx prisma migrate dev</code></li>
            <li>Restart the server</li>
          </ol>
        </div>
      </form>
    </div>
  );
};

export default ModelDefinitionPage;

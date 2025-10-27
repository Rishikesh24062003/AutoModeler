import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dataAPI, modelAPI, handleAPIError } from '../services/api';
import type { DataRecord, ModelDefinition } from '../types';
import './DataManagementPage.css';

const DataManagementPage: React.FC = () => {
  const { modelName } = useParams<{ modelName: string }>();
  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (modelName) {
      loadModelAndData();
    }
  }, [modelName]);

  const loadModelAndData = async () => {
    if (!modelName) return;
    
    setLoading(true);
    try {
      const [modelDef, records] = await Promise.all([
        modelAPI.getModel(modelName),
        dataAPI.getData(modelName),
      ]);
      setModel(modelDef);
      setData(records);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (record: DataRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!modelName || !confirm('Are you sure you want to delete this record?')) return;

    try {
      await dataAPI.deleteRecord(modelName, id);
      await loadModelAndData();
    } catch (err) {
      alert(handleAPIError(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName) return;

    try {
      if (editingRecord) {
        await dataAPI.updateRecord(modelName, editingRecord.id, formData);
      } else {
        await dataAPI.createRecord(modelName, formData);
      }
      setShowModal(false);
      await loadModelAndData();
    } catch (err) {
      alert(handleAPIError(err));
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-page">Error: {error}</div>;
  }

  if (!model) {
    return <div className="error-page">Model not found</div>;
  }

  return (
    <div className="data-management-page">
      <div className="page-header">
        <div>
          <h1>{model.name} Data</h1>
          <p>Manage {model.name.toLowerCase()} records</p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          ➕ Add New
        </button>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <p>No records yet</p>
          <button onClick={handleCreate} className="btn btn-primary">
            Create First Record
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                {model.fields.map((field) => (
                  <th key={field.name}>{field.name}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  {model.fields.map((field) => (
                    <td key={field.name}>{String(record[field.name] ?? '-')}</td>
                  ))}
                  <td>
                    <button onClick={() => handleEdit(record)} className="btn-action">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="btn-action">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRecord ? 'Edit' : 'Create'} {model.name}</h2>
            <form onSubmit={handleSubmit}>
              {model.fields.map((field) => (
                <div key={field.name} className="form-group">
                  <label>{field.name}{field.required && ' *'}</label>
                  <input
                    type={field.type === 'Int' || field.type === 'Float' ? 'number' : 'text'}
                    value={formData[field.name] ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.required}
                  />
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagementPage;

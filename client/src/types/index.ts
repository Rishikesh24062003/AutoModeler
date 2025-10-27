// User and Authentication Types
export interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'VIEWER';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: 'ADMIN' | 'MANAGER' | 'VIEWER';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Model Definition Types
export interface ModelField {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  default?: any;
}

export interface ModelRBAC {
  [role: string]: string[];
}

export interface ModelDefinition {
  name: string;
  fields: ModelField[];
  rbac: ModelRBAC;
  ownerField?: string;
  createdAt?: string;
}

export interface ModelSummary {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  tableName: string;
  fields: number;
  records: number;
  createdAt: string;
}

// Data Record Types
export interface DataRecord {
  id: number;
  [key: string]: any;
}

export interface APIResponse<T = any> {
  message?: string;
  data?: T;
  count?: number;
  error?: string;
  details?: string;
}

// Form Types
export interface FieldFormData {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default: string;
}

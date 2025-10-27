import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import modelRoutes from './routes/model.routes';
import userRoutes from './routes/user.routes';
import { initializeDynamicRoutes } from './services/dynamicRouter.service';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Server is running',
    version: '1.0.0',
    endpoints: {
      root: '/',
      auth: '/api/auth (register, login, me)',
      models: '/api/models (publish, list)',
      dynamicAPIs: '/api/<modelname>s (CRUD with RBAC)'
    }
  });
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount model routes (for publishing and listing models)
app.use('/api/models', modelRoutes);

// Mount user management routes (Super Admin only)
app.use('/api/users', userRoutes);

// Port configuration
const PORT = process.env.PORT || 3001;

// Async server initialization to load dynamic routes from database
async function startServer() {
  try {
    // Initialize dynamic routes for all published models from database
    await initializeDynamicRoutes(app);

    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}`);
      console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
      console.log(`📚 Model Management: http://localhost:${PORT}/api/models`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

startServer();

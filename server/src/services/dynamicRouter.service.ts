import { Express, Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';

// Track loaded model routes to prevent duplicates
const loadedModels = new Set<string>();
let appInstance: Express | null = null;

/**
 * Initializes dynamic routes for all model definitions from the database
 * This function reads all active models from the database and
 * creates full CRUD endpoints for each model
 * 
 * @param app - Express application instance
 */
export async function initializeDynamicRoutes(app: Express): Promise<void> {
  // Store app instance for later use
  appInstance = app;
  console.log('\n🔄 Initializing dynamic routes from database...');

  try {
    // Fetch all active models with their fields and permissions
    const models = await prisma.model.findMany({
      where: { isActive: true },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        permissions: true
      }
    });

    if (models.length === 0) {
      console.log('📭 No model definitions found. Waiting for models to be published...');
      return;
    }

    console.log(`📦 Found ${models.length} model(s)`);

    // Process each model
    for (const model of models) {
      const routePath = `/api/${model.tableName}`;

      // Skip if already loaded
      if (loadedModels.has(model.tableName)) {
        console.log(`  ⏩ Skipping (already loaded): ${model.name}`);
        continue;
      }

      console.log(`  ➡️  Generating CRUD routes for: ${model.name} at ${routePath}`);

      // Create a new router for this model
      const router = createCRUDRouter(model);

      // Mount the router
      app.use(routePath, router);

      // Mark as loaded
      loadedModels.add(model.tableName);

      console.log(`  ✅ Routes created: POST, GET, GET/:id, PUT/:id, DELETE/:id`);
    }

    console.log('🎉 Dynamic routes initialization complete!\n');
  } catch (error) {
    console.error('❌ Error initializing dynamic routes:', error);
  }
}

/**
 * Load routes for a single model (used when a new model is published)
 * @param modelId - The ID of the model to load
 */
export async function loadModelRoutes(modelId: number): Promise<void> {
  if (!appInstance) {
    console.error('❌ App instance not available. Cannot load model routes.');
    return;
  }

  try {
    // Fetch the specific model from database
    const model = await prisma.model.findUnique({
      where: { id: modelId },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        permissions: true
      }
    });

    if (!model) {
      console.error(`❌ Model with ID ${modelId} not found`);
      return;
    }

    if (!model.isActive) {
      console.log(`⏸️  Model "${model.name}" is inactive, skipping route loading`);
      return;
    }

    const routePath = `/api/${model.tableName}`;

    // Check if already loaded
    if (loadedModels.has(model.tableName)) {
      console.log(`✅ Routes for "${model.name}" already loaded at ${routePath}`);
      return;
    }

    console.log(`\n🔄 Loading routes for new model: ${model.name}`);
    console.log(`  ➡️  Creating CRUD routes at ${routePath}`);

    // Create router
    const router = createCRUDRouter(model);

    // Mount router
    appInstance.use(routePath, router);

    // Mark as loaded
    loadedModels.add(model.tableName);

    console.log(`  ✅ Routes created: POST, GET, GET/:id, PUT/:id, DELETE/:id`);
    console.log(`🎉 Model "${model.name}" is now accessible!\n`);
  } catch (error) {
    console.error('❌ Error loading model routes:', error);
  }
}

/**
 * Creates a CRUD router for a specific model using the Record table
 * 
 * @param model - The model object from database with fields and permissions
 * @returns Express Router with CRUD endpoints
 */
function createCRUDRouter(model: any): Router {
  const router = Router();

  // Apply authentication to all routes
  router.use(requireAuth);

  // Helper: Check if user has permission for an action
  const checkPermission = (req: Request, action: 'canCreate' | 'canRead' | 'canUpdate' | 'canDelete'): boolean => {
    const userRole = req.user?.role;
    const permission = model.permissions.find((p: any) => p.role === userRole);
    return permission ? permission[action] : false;
  };

  // POST / - Create a new record
  router.post('/', async (req: Request, res: Response) => {
    try {
      // Check create permission
      if (!checkPermission(req, 'canCreate')) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to create records for this model',
        });
      }

      const data = req.body;

      // Validate required fields
      for (const field of model.fields) {
        if (field.isRequired && (data[field.name] === undefined || data[field.name] === null || data[field.name] === '')) {
          return res.status(400).json({
            error: `Field "${field.displayName}" is required`,
          });
        }
      }

      // Validate field types
      for (const field of model.fields) {
        if (data[field.name] !== undefined && data[field.name] !== null) {
          const value = data[field.name];
          
          switch (field.type) {
            case 'Int':
              if (!Number.isInteger(Number(value))) {
                return res.status(400).json({
                  error: `Field "${field.displayName}" must be an integer`,
                });
              }
              data[field.name] = parseInt(value);
              break;
            case 'Float':
              if (isNaN(Number(value))) {
                return res.status(400).json({
                  error: `Field "${field.displayName}" must be a number`,
                });
              }
              data[field.name] = parseFloat(value);
              break;
            case 'Boolean':
              data[field.name] = Boolean(value);
              break;
          }
        }
      }

      // Create record in Record table
      const record = await prisma.record.create({
        data: {
          modelId: model.id,
          ownerId: req.user!.id,
          data: data, // Store all field values as JSON
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });

      return res.status(201).json({
        message: `${model.displayName} created successfully`,
        data: {
          id: record.id,
          ...(record.data as any),
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          owner: record.owner,
        },
      });

    } catch (error: any) {
      console.error(`Error creating ${model.name}:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    }
  });

  // GET / - Get all records
  router.get('/', async (req: Request, res: Response) => {
    try {
      // Check read permission
      if (!checkPermission(req, 'canRead')) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to read records for this model',
        });
      }

      const records = await prisma.record.findMany({
        where: { modelId: model.id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Transform records to include data fields
      const transformedRecords = records.map((record: any) => ({
        id: record.id,
        ...(record.data as any),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        owner: record.owner,
      }));

      return res.json({
        data: transformedRecords,
        count: records.length,
      });

    } catch (error: any) {
      console.error(`Error fetching ${model.name}s:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    }
  });

  // GET /:id - Get a single record by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      // Check read permission
      if (!checkPermission(req, 'canRead')) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to read records for this model',
        });
      }

      const { id } = req.params;
      
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const record = await prisma.record.findFirst({
        where: { 
          id: numericId,
          modelId: model.id 
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });

      if (!record) {
        return res.status(404).json({
          error: `${model.displayName} with id ${id} not found`,
        });
      }

      return res.json({ 
        data: {
          id: record.id,
          ...(record.data as any),
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          owner: record.owner,
        }
      });

    } catch (error: any) {
      console.error(`Error fetching ${model.name}:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    }
  });

  // PUT /:id - Update a record
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      // Check update permission
      if (!checkPermission(req, 'canUpdate')) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to update records for this model',
        });
      }

      const { id } = req.params;
      const data = req.body;

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      // Check if record exists
      const existingRecord = await prisma.record.findFirst({
        where: { 
          id: numericId,
          modelId: model.id 
        },
      });

      if (!existingRecord) {
        return res.status(404).json({
          error: `${model.displayName} with id ${id} not found`,
        });
      }

      // Check ownership (non-admins can only update their own records)
      if (req.user?.role !== 'ADMIN' && existingRecord.ownerId !== req.user?.id) {
        return res.status(403).json({
          error: 'Forbidden: You can only update your own records',
        });
      }

      // Validate field types
      for (const field of model.fields) {
        if (data[field.name] !== undefined && data[field.name] !== null) {
          const value = data[field.name];
          
          switch (field.type) {
            case 'Int':
              if (!Number.isInteger(Number(value))) {
                return res.status(400).json({
                  error: `Field "${field.displayName}" must be an integer`,
                });
              }
              data[field.name] = parseInt(value);
              break;
            case 'Float':
              if (isNaN(Number(value))) {
                return res.status(400).json({
                  error: `Field "${field.displayName}" must be a number`,
                });
              }
              data[field.name] = parseFloat(value);
              break;
            case 'Boolean':
              data[field.name] = Boolean(value);
              break;
          }
        }
      }

      // Update the record
      const updatedRecord = await prisma.record.update({
        where: { id: numericId },
        data: {
          data: data, // Update JSON data
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              role: true,
            }
          }
        }
      });

      return res.json({
        message: `${model.displayName} updated successfully`,
        data: {
          id: updatedRecord.id,
          ...(updatedRecord.data as any),
          createdAt: updatedRecord.createdAt,
          updatedAt: updatedRecord.updatedAt,
          owner: updatedRecord.owner,
        },
      });

    } catch (error: any) {
      console.error(`Error updating ${model.name}:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    }
  });

  // DELETE /:id - Delete a record
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      // Check delete permission
      if (!checkPermission(req, 'canDelete')) {
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to delete records for this model',
        });
      }

      const { id } = req.params;

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      // Check if record exists
      const existingRecord = await prisma.record.findFirst({
        where: { 
          id: numericId,
          modelId: model.id 
        },
      });

      if (!existingRecord) {
        return res.status(404).json({
          error: `${model.displayName} with id ${id} not found`,
        });
      }

      // Check ownership (non-admins can only delete their own records)
      if (req.user?.role !== 'ADMIN' && existingRecord.ownerId !== req.user?.id) {
        return res.status(403).json({
          error: 'Forbidden: You can only delete your own records',
        });
      }

      // Delete the record
      await prisma.record.delete({
        where: { id: numericId },
      });

      return res.json({
        message: `${model.displayName} deleted successfully`,
      });

    } catch (error: any) {
      console.error(`Error deleting ${model.name}:`, error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    }
  });

  return router;
}

export default { initializeDynamicRoutes };

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import { loadModelRoutes } from '../services/dynamicRouter.service';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

/**
 * POST /api/models/publish
 * Publishes a new model definition to the database
 * 
 * Expected request body:
 * {
 *   name: string,
 *   displayName: string,
 *   description?: string,
 *   fields: Array<{ name: string, displayName: string, type: string, isRequired: boolean, ... }>,
 *   permissions: { [role: string]: { canCreate, canRead, canUpdate, canDelete } }
 * }
 */
router.post('/publish', async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, fields, permissions } = req.body;

    // Strict validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ 
        error: 'Validation failed: "name" is required and must be a string' 
      });
    }

    if (!displayName || typeof displayName !== 'string') {
      return res.status(400).json({ 
        error: 'Validation failed: "displayName" is required and must be a string' 
      });
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed: "fields" is required and must be a non-empty array' 
      });
    }

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ 
        error: 'Validation failed: "permissions" is required and must be an object' 
      });
    }

    // Validate each field has required properties
    for (const field of fields) {
      if (!field.name || typeof field.name !== 'string') {
        return res.status(400).json({ 
          error: 'Validation failed: Each field must have a "name" property (string)' 
        });
      }
      if (!field.type || typeof field.type !== 'string') {
        return res.status(400).json({ 
          error: 'Validation failed: Each field must have a "type" property (string)' 
        });
      }
    }

    // Check if model already exists
    const existingModel = await prisma.model.findUnique({
      where: { name }
    });

    if (existingModel) {
      return res.status(400).json({
        error: `Model "${name}" already exists`
      });
    }

    // Generate table name (lowercase plural)
    const tableName = name.toLowerCase() + 's';

    // Create model with fields and permissions in a transaction
    const model = await prisma.$transaction(async (tx) => {
      // 1. Create the model
      const createdModel = await tx.model.create({
        data: {
          name,
          displayName,
          description: description || null,
          tableName,
          createdById: req.user!.id,
        }
      });

      // 2. Create fields
      const fieldPromises = fields.map((field: any, index: number) => {
        return tx.field.create({
          data: {
            name: field.name,
            displayName: field.displayName || field.name,
            type: field.type,
            isRequired: field.isRequired || false,
            isUnique: field.isUnique || false,
            defaultValue: field.defaultValue ? JSON.stringify(field.defaultValue) : null,
            validation: field.validation ? JSON.stringify(field.validation) : null,
            order: field.order !== undefined ? field.order : index,
            modelId: createdModel.id,
          }
        });
      });

      await Promise.all(fieldPromises);

      // 3. Create permissions for each role
      const permissionPromises = Object.entries(permissions).map(([role, perms]: [string, any]) => {
        return tx.modelPermission.create({
          data: {
            modelId: createdModel.id,
            role: role as any,
            canCreate: perms.canCreate || false,
            canRead: perms.canRead || false,
            canUpdate: perms.canUpdate || false,
            canDelete: perms.canDelete || false,
          }
        });
      });

      await Promise.all(permissionPromises);

      return createdModel;
    });

    console.log(`✅ Model "${name}" published successfully to database`);
    console.log(`🔄 Loading dynamic routes automatically...`);

    // Load routes for the new model immediately (no server restart needed!)
    await loadModelRoutes(model.id);

    return res.status(201).json({
      message: 'Model published successfully and routes loaded',
      model: {
        id: model.id,
        name: model.name,
        displayName: model.displayName,
        tableName: model.tableName,
      },
      notice: 'The API endpoints are now available immediately!',
    });

  } catch (error) {
    console.error('Error publishing model:', error);
    return res.status(500).json({ 
      error: 'Internal server error while publishing model' 
    });
  }
});

/**
 * GET /api/models
 * Returns a list of all available models from the database
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const models = await prisma.model.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { fields: true, records: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const modelList = models.map((model: any) => ({
      id: model.id,
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      tableName: model.tableName,
      fields: model._count.fields,
      records: model._count.records,
      createdAt: model.createdAt,
    }));

    return res.json({ models: modelList });

  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(500).json({ 
      error: 'Internal server error while fetching models' 
    });
  }
});

/**
 * GET /api/models/:modelName
 * Returns the full definition of a specific model from the database
 */
router.get('/:modelName', async (req: Request, res: Response) => {
  try {
    const { modelName } = req.params;

    const model = await prisma.model.findUnique({
      where: { name: modelName },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        permissions: true
      }
    });

    if (!model) {
      return res.status(404).json({ 
        error: `Model "${modelName}" not found` 
      });
    }

    // Transform permissions from array to object by role
    const permissionsObj: any = {};
    model.permissions.forEach(perm => {
      permissionsObj[perm.role] = {
        canCreate: perm.canCreate,
        canRead: perm.canRead,
        canUpdate: perm.canUpdate,
        canDelete: perm.canDelete,
      };
    });

    const modelDefinition = {
      id: model.id,
      name: model.name,
      displayName: model.displayName,
      description: model.description,
      tableName: model.tableName,
      fields: model.fields.map(field => ({
        id: field.id,
        name: field.name,
        displayName: field.displayName,
        type: field.type,
        isRequired: field.isRequired,
        isUnique: field.isUnique,
        defaultValue: field.defaultValue ? JSON.parse(field.defaultValue) : null,
        validation: field.validation ? JSON.parse(field.validation) : null,
        order: field.order,
      })),
      permissions: permissionsObj,
      createdAt: model.createdAt,
    };

    return res.json({ model: modelDefinition });

  } catch (error) {
    console.error('Error fetching model:', error);
    return res.status(500).json({ 
      error: 'Internal server error while fetching model' 
    });
  }
});

export default router;

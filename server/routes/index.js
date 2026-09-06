import { Router } from 'express';
import healthRoutes from './health.js';
import promptsRoutes from './prompts.js';
import ingestionRoutes from './ingestion.js';
import { lookupIcons } from '../controllers/ingestionController.js';

const router = Router();

// Mount sub-routes
router.use('/health', healthRoutes);
router.use('/prompts', promptsRoutes);
router.use('/ingest', ingestionRoutes);
router.use('/icons', lookupIcons);

export default router;

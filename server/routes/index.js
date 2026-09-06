import { Router } from 'express';
import healthRoutes from './health.js';
import promptsRoutes from './prompts.js';

const router = Router();

// Mount sub-routes
router.use('/health', healthRoutes);
router.use('/prompts', promptsRoutes);

export default router;

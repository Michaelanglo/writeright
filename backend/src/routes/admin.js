import express from 'express';
import {
    getAllParents,
    createParent,
    getAllChildren,
    createChild
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);

// Parents
router.get('/', getAllParents);
router.post('/parents', createParent);

// Children
router.get('/children', getAllChildren);
router.post('/parents/:parentId/children', createChild);

export default router;

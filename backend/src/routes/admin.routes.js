import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { requireDatabase } from '../middleware/requireDatabase.js';
import { ROLES } from '../constants/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireDatabase);
router.use(authenticate);

router.post(
  '/create-user',
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(adminController.createUser),
);

router.get(
  '/users',
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(adminController.getUsers),
);

router.patch(
  '/user/:id',
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(adminController.updateUser),
);

router.delete(
  '/user/:id',
  authorize(ROLES.SUPER_ADMIN),
  asyncHandler(adminController.deleteUser),
);

export default router;

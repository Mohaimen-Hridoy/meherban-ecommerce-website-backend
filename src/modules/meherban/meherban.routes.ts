import { Router } from 'express';
import { MeherbanController } from './meherban.controller.js';

const router = Router();

router.get('/categories', MeherbanController.getCategories);
router.get('/products', MeherbanController.getProducts);
router.get('/products/:id', MeherbanController.getProductById);
router.post('/orders', MeherbanController.createOrder);
router.post('/newsletter', MeherbanController.subscribeNewsletter);

export default router;

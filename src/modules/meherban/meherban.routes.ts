import { Router } from 'express';
import { MeherbanController } from './meherban.controller.js';
import { uploadMiddleware } from './meherban.upload.js';

const router = Router();

// Image Upload Endpoint (Supports Cloudinary CDN or Local Storage fallback)
router.post('/upload', uploadMiddleware.single('image'), MeherbanController.uploadImage);

// Public Customer Endpoints (No login required - Guest Browsing & Fast Checkout)
router.get('/categories', MeherbanController.getCategories);
router.get('/products', MeherbanController.getProducts);
router.get('/products/:id', MeherbanController.getProductById);
router.post('/orders', MeherbanController.createOrder);
router.post('/newsletter', MeherbanController.subscribeNewsletter);

// Super Admin Endpoints (Platform-wide controls & Sellers management)
router.post('/admin/login', MeherbanController.adminLogin);
router.get('/admin/orders', MeherbanController.getOrders);
router.patch('/admin/orders/:id/status', MeherbanController.updateOrderStatus);
router.get('/admin/stats', MeherbanController.getStats);
router.get('/admin/sellers', MeherbanController.getSellers);
router.post('/admin/sellers', MeherbanController.createSeller);
router.patch('/admin/sellers/:id/toggle', MeherbanController.toggleSeller);

// Seller Account Endpoints
router.post('/seller/login', MeherbanController.sellerLogin);
router.get('/seller/:sellerId/stats', MeherbanController.getSellerStats);

// Product Management (Add, Edit, Stock toggle, Delete)
router.post('/products', MeherbanController.createProduct);
router.put('/products/:id', MeherbanController.updateProduct);
router.patch('/products/:id/stock', MeherbanController.updateStock);
router.delete('/products/:id', MeherbanController.deleteProduct);

export default router;

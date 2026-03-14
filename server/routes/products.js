const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { authenticateAdmin } = require('../middleware/authAdmin');

// Public routes
router.get('/', ctrl.getAllProducts);
router.get('/categories', ctrl.getCategories);
router.get('/:id', ctrl.getProduct);

// Admin-only routes (create, update, delete)
router.post('/', authenticateAdmin, ctrl.createProduct);
router.put('/:id', authenticateAdmin, ctrl.updateProduct);
router.delete('/:id', authenticateAdmin, ctrl.deleteProduct);

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate);

router.get('/', productController.getItems);
router.get('/:id', productController.getItemById);
router.post('/', upload.single('image'), productController.createItem);
router.put('/:id', upload.single('image'), productController.updateItem);
router.delete('/:id', productController.deleteItem); // Soft delete -> Trash
router.post('/:id/restore', productController.restoreItem); // Restore from Trash
router.delete('/:id/permanent', productController.permanentDeleteItem); // Hard delete
router.patch('/:id/favorite', productController.toggleFavorite);
router.post('/:id/use', productController.useItem);

module.exports = router;

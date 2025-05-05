// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/multerCloudinary');
const categoryController = require('../controller/categoryController');

router.post('/creat-category', upload.single('image'), categoryController.createCategory);
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:categoryId', categoryController.getCategoryById);
router.put('/categories/:categoryId', upload.single('categoryImage'), categoryController.updateCategory);
router.delete('/categories/:categoryId', categoryController.deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const { upload } = require('../middleware/multerCloudinary');

router.post('/creat-products', upload.single('image'), productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/products/:productId', productController.getProductById);
router.put('/products/:productId', upload.single('image'), productController.updateProduct);
router.delete('/products/:productId', productController.deleteProduct);

module.exports = router;

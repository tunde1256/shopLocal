const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const {authenticateJWT} = require('../middleware/auth');

router.post('/add', authenticateJWT, cartController.addToCart);
router.get('/all', authenticateJWT,cartController.getCart);
router.delete('/:productId', authenticateJWT, cartController.removeFromCart);
router.delete('/', authenticateJWT, cartController.clearCart);

module.exports = router;

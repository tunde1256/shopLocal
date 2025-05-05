const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controller/orderController');

const { authenticateJWT, isAdmin } = require('../middleware/auth');

router.post('/', authenticateJWT, placeOrder);
router.get('/my-orders', authenticateJWT, getUserOrders);
router.get('/:orderId', authenticateJWT, getOrderById);
router.delete('/:orderId', authenticateJWT, cancelOrder);
router.patch('/:orderId/status', authenticateJWT, isAdmin, updateOrderStatus);
router.get('/', authenticateJWT, isAdmin, getAllOrders);

module.exports = router;

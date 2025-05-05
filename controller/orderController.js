const Order = require('../model/orderModel');
const Cart = require('../model/cartModel');
const Product = require('../model/productModel');

// Place an order
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Optional: re-fetch product prices for accuracy
    const updatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          productId: product._id,
          name: product.name,
          price: product.price, // use current product price
          quantity: item.quantity,
          image: product.image
        };
      })
    );

    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      userId,
      items: updatedItems,
      totalAmount,
      status: 'pending' // default can also be "processing"
    });

    await newOrder.save();
    await Cart.findOneAndDelete({ userId });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Place Order Error:', err);
    res.status(500).json({ message: 'Failed to place order' });
  }
};

// Cancel or delete an order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: only allow cancel if not yet shipped/completed
    if (order.status === 'shipped' || order.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed or shipped order' });
    }

    await Order.findByIdAndDelete(orderId);

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Cancel Order Error:', err);
    res.status(500).json({ message: 'Failed to cancel order' });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id });
  res.json(orders);
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
};

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
};

// Update order status (admin or internal use)
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json(order);
};

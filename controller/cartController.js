const Cart = require('../model/cartModel');
const Product = require('../model/productModel');


exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });

    const itemData = {
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity || 1,
    };

    if (!cart) {
      cart = new Cart({ userId, items: [itemData] });
    } else {
      const index = cart.items.findIndex(item => item.productId.toString() === productId);
      if (index > -1) {
        cart.items[index].quantity += quantity || 1;
      } else {
        cart.items.push(itemData);
      }
    }

    await cart.save();
    res.status(200).json(cart);

  } catch (err) {
    console.error('Add to Cart Error:', err);
    res.status(500).json({ message: err.message });
  }
};


// Get cart
exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart || { items: [] });
};

// Remove item
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.items = cart.items.filter(item => item.productId !== productId);
  await cart.save();
  res.json(cart);
};

// Clear cart
exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ userId: req.user.id });
  res.json({ message: 'Cart cleared' });
};

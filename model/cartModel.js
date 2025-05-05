const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      image: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);

// models/productModel.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cartCount: { type: Number, default: 0 },
  totalRating: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  colors: [String],
  sizes: [String],
  availability: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

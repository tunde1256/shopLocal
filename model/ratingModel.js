const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  imageUrl: { type: String }, 
  date: { type: Date, default: Date.now }
}, { timestamps: true });

ratingSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);

const Rating = require('../model/ratingModel');
const Product = require('../model/productModel');
const { uploadToCloudinary } = require('../middleware/multerCloudinary');

exports.createRating = async (req, res) => {
  try {
    const { productId, userId, rating } = req.body;

    if (!productId || !userId || !rating) {
      return res.status(400).json({ message: 'productId, userId, and rating are required.' });
    }

    // Check for existing rating
    const existingRating = await Rating.findOne({ productId, userId });
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this product.' });
    }

    // Fetch the product to get the image
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Always use the product's image
    const imageUrl = product.image || '';

    // Create and save the rating
    const newRating = new Rating({
      productId,
      userId,
      rating,
      imageUrl, // Always from the product
    });

    const savedRating = await newRating.save();

    // Update product's average rating and total ratings
    await updateProductRatings(productId);

    res.status(201).json({
      message: 'Rating created successfully.',
      rating: {
        _id: savedRating._id,
        productId: savedRating.productId,
        userId: savedRating.userId,
        rating: savedRating.rating,
        imageUrl: savedRating.imageUrl, // From product
      }
    });

  } catch (err) {
    console.error('Error creating rating:', err);
    res.status(500).json({ message: err.message });
  }
};


exports.getRatingsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const ratings = await Rating.find({ productId }).populate('userId', 'name email');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const { rating } = req.body;

    const existingRating = await Rating.findOne({ productId, userId });
    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found.' });
    }

    if (rating !== undefined) existingRating.rating = rating;

    // Force imageUrl from product
    const product = await Product.findById(productId);
    if (product && product.image) {
      existingRating.imageUrl = product.image;
    }

    const updatedRating = await existingRating.save();

    await updateProductRatings(productId);

    res.json(updatedRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteRating = async (req, res) => {
  try {
    const { productId, userId } = req.params;

    const deletedRating = await Rating.findOneAndDelete({ productId, userId });
    if (!deletedRating) {
      return res.status(404).json({ message: 'Rating not found.' });
    }

    await updateProductRatings(productId);

    res.json({ message: 'Rating deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProductRatings = async (productId) => {
  const ratings = await Rating.find({ productId });

  const totalRatings = ratings.length;
  const totalRatingSum = ratings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

  await Product.findByIdAndUpdate(productId, {
    totalRating: totalRatingSum,
    averageRating,
  });
};

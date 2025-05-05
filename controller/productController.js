const Product = require('../model/productModel');
const { v4: uuidv4 } = require('uuid');
const { uploadToCloudinary } = require('../middleware/multerCloudinary');
const Category = require('../model/categoryModel');
const logger = require('../utils/logger');

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      uploadedBy,
      categoryId,
      categoryName, 
      colors,
      sizes,
      availability
    } = req.body;

   
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.categoryName !== categoryName) {
      return res.status(400).json({
        message: `Category name mismatch. Provided: "${categoryName}", Expected: "${category.categoryName}"`
      });
    }

    let imageUrl = '';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    const product = new Product({
      productId: uuidv4(),
      name,
      description,
      price,
      uploadedBy,
      image: imageUrl,
      category: category._id,
      colors,
      sizes,
      availability
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (optionally update image)
exports.updateProduct = async (req, res) => {
  try {
    const updateFields = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updateFields.image = uploadResult.secure_url;
    }

    const updated = await Product.findOneAndUpdate(
      { productId: req.params.productId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ productId: req.params.productId });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

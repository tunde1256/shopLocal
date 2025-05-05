const Category = require('../model/categoryModel');
const { uploadToCloudinary } = require('../middleware/multerCloudinary');

exports.createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    let imageUrl = '';

    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = cloudinaryResult.secure_url;
    }

    const category = new Category({
      categoryName,
      categoryImage: imageUrl
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ categoryId: req.params.categoryId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update category (optionally update image)
exports.updateCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const updateFields = {};

    if (categoryName) updateFields.categoryName = categoryName;

    if (req.file) {
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      updateFields.categoryImage = cloudinaryResult.secure_url;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { categoryId: req.params.categoryId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findOneAndDelete({ categoryId: req.params.categoryId });

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

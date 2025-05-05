const express = require('express');
const router = express.Router();
const ratingController = require('../controller/ratingController');
const { upload } = require('../middleware/multerCloudinary'); // Import Multer upload middleware

router.post('/rating', upload.single('image'), ratingController.createRating); // Create a new rating with image upload
router.get('/:productId', ratingController.getRatingsByProduct); // Get all ratings for a product
router.put('/:productId/:userId', upload.single('image'), ratingController.updateRating); // Update a rating with image upload
router.delete('/:productId/:userId', ratingController.deleteRating); // Delete a rating

module.exports = router;

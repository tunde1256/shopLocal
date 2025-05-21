const express = require('express');
const userController = require('../controller/usercontroller');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Public routes (no authentication required)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes (authentication required)
router.get('/getUser/:id', userController.getUser);
router.get('/getAllUsers', userController.getAllUsers);
router.patch('/become-seller', userController.becomeSeller);
router.delete('/deleteUser/:id', userController.deleteUser);

module.exports = router;

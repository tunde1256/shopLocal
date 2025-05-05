const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { authenticateJWT, isAdmin } = require('../middleware/auth');

// Public Routes
router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/reset-password', adminController.resetPassword);

// Protected Routes (require login)
router.get('/all', authenticateJWT, isAdmin, adminController.getAllAdmins);
router.get('/:id', authenticateJWT, isAdmin, adminController.getAdminById);
router.put('/:id', authenticateJWT, isAdmin, adminController.updateAdmin);
router.delete('/:id', authenticateJWT, isAdmin, adminController.deleteAdmin);

module.exports = router;

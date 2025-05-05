const Admin = require('../model/adminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const logger = require('../utils/logger'); 
const { authenticateJWT, isAdmin } = require('../middleware/auth');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      logger.warn(`Registration attempt with existing username/email: ${username} / ${email}`);
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();
    logger.info(`New admin registered: ${username}`);
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      logger.warn(`Failed login attempt for username: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id, isAdmin: admin.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    logger.info(`Admin logged in: ${username}`);
    res.json({ token });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    logger.info(`Fetched all admins by user: ${req.user?.id}`);
    res.json(admins);
  } catch (err) {
    logger.error(`Get all admins error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      logger.warn(`Admin not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Admin not found' });
    }
    logger.info(`Fetched admin: ${admin.username}`);
    res.json(admin);
  } catch (err) {
    logger.error(`Get admin by ID error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAdmin) {
      logger.warn(`Update failed - admin not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Admin not found' });
    }
    logger.info(`Admin updated: ${updatedAdmin.username}`);
    res.json(updatedAdmin);
  } catch (err) {
    logger.error(`Update admin error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      logger.warn(`Delete failed - admin not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Admin not found' });
    }
    logger.info(`Admin deleted: ${deletedAdmin.username}`);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    logger.error(`Delete admin error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      logger.warn(`Forgot password requested for non-existing email: ${email}`);
      return res.status(404).json({ message: 'Admin not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    admin.resetPasswordToken = resetToken;
    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await admin.save();

    const transporter = nodemailer.createTransport({
      // Example placeholder, replace with actual config
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      to: admin.email,
      from: 'no-reply@yourapp.com',
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link to reset: ${process.env.BASE_URL}/reset-password/${resetToken}`
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${email}`);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    logger.error(`Forgot password error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const admin = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!admin) {
      logger.warn(`Reset password failed: invalid or expired token`);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    logger.info(`Password reset successful for: ${admin.email}`);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    logger.error(`Reset password error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
    const { fullName, email, phone, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const user = new User({
        fullName,
        email,
        phone,
        password: hashedPassword
      
      });
  
      await user.save();
  
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          isSeller: user.seller.isSeller
        }
      });
    } catch (error) {
      logger.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

  exports.becomeSeller = async (req, res) => {
    const { shopName, category } = req.body;
    const userId = req.user.id;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      if (user.seller && user.seller.isSeller) {
        return res.status(400).json({ message: 'User is already a seller' });
      }
  
      user.seller = {
        isSeller: true,
        sellerId: uuidv4(),
        shopName,
        category
      };
  
      await user.save();
  
      res.status(200).json({
        message: 'Seller profile created',
        seller: user.seller
      });
    } catch (error) {
      logger.error('Error becoming seller:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
    
  exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      const dashboard = user.seller.isSeller ? 'seller' : 'user';
  
      res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email,
          dashboard
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Generate a 6-digit numeric token
        const token = Math.floor(100000 + Math.random() * 900000).toString(); // e.g. "345678"

        // 3. Assign token and expiry to user
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        // 4. Save user without triggering full validation errors
        await user.save({ validateBeforeSave: false });

        // 5. Configure transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 6. Define email content with token only
        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset Token',
            text: `You have requested a password reset.\n\n` +
                  `Use the following 6-digit token to reset your password:\n\n` +
                  `${token}\n\n` +
                  `This token will expire in 1 hour.\n\n` +
                  `If you did not request this, please ignore this email.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Password reset token sent to your email', token });

    } catch (error) {
        logger.error('Error sending password reset email:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        logger.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.getUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        logger.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email _id'); 
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, address, email, phone } = req.body;

    try {
        const user = await User.findByIdAndUpdate(userId, { name, address, email, phone }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        logger.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        logger.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    }
    catch (error) {
        logger.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.updatePassword = async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
        logger.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
exports.getUserByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        logger.error('Error fetching user by email:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
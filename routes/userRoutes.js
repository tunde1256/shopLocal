const express = require('express');
const userController = require('../controller/usercontroller');
const router = express.Router();
const logger = require('../utils/logger');
const { getUser } = require('../controller/usercontroller');

router.post('/register',userController.register);
 router.post('/login', userController.login);
 router.post('/forgot-password', userController.forgotPassword);
 router.post('/reset-password/:token', userController.resetPassword);
 router.get('/getUser',userController.getUser );

 router.delete('/deleteUser/:id', userController.deleteUser);

module.exports = router;
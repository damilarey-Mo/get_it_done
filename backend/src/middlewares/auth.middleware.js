const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+password');
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'User recently changed password. Please log in again.'
      });
    }

    // 5) Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // 6) Check if user is verified
    if (!currentUser.isVerified) {
      return res.status(401).json({
        status: 'error',
        message: 'Please verify your email address to continue.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token. Please log in again.'
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

const verifyRunner = async (req, res, next) => {
  if (req.user.role !== 'runner') {
    return res.status(403).json({
      status: 'error',
      message: 'Only runners can perform this action.'
    });
  }

  if (!req.user.runnerProfile.isApproved) {
    return res.status(403).json({
      status: 'error',
      message: 'Your runner account is not yet approved.'
    });
  }

  next();
};

const verifyCustomer = async (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({
      status: 'error',
      message: 'Only customers can perform this action.'
    });
  }
  next();
};

module.exports = {
  protect,
  restrictTo,
  verifyRunner,
  verifyCustomer
}; 
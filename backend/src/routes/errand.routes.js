const express = require('express');
const router = express.Router();
const errandController = require('../controllers/errand.controller');
const { protect, verifyCustomer, verifyRunner } = require('../middlewares/auth.middleware');

// Public routes
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Errand service is running'
  });
});

// Protected routes
router.use(protect);

// Customer routes
router.post('/', verifyCustomer, errandController.createErrand);
router.get('/my-errands', verifyCustomer, errandController.getUserErrands);
router.get('/:id', errandController.getErrand);
router.patch('/:id/cancel', verifyCustomer, errandController.updateErrandStatus);
router.post('/:id/rate', verifyCustomer, errandController.rateErrand);

// Runner routes
router.get('/available', verifyRunner, errandController.getAvailableErrands);
router.post('/:id/accept', verifyRunner, errandController.acceptErrand);
router.patch('/:id/status', verifyRunner, errandController.updateErrandStatus);
router.get('/runner/my-errands', verifyRunner, errandController.getUserErrands);

// Admin routes
router.get('/', protect, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Only admins can access all errands'
    });
  }
  next();
}, errandController.getAllErrands);

module.exports = router; 
const Errand = require('../models/errand.model');
const User = require('../models/user.model');
const { calculateDistance } = require('../utils/geolocation');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

// Create new errand
exports.createErrand = async (req, res) => {
  try {
    const {
      type,
      priority,
      pickupLocation,
      dropoffLocation,
      items,
      specialInstructions,
      scheduledFor
    } = req.body;

    // Calculate distance and estimated duration
    const distance = await calculateDistance(
      pickupLocation.coordinates,
      dropoffLocation.coordinates
    );

    // Calculate base price based on distance and type
    const basePrice = calculateBasePrice(distance, type);
    const priorityFee = priority === 'priority' ? basePrice * 0.2 : 0;
    const serviceFee = basePrice * 0.1;
    const totalPrice = basePrice + priorityFee + serviceFee;

    // Create new errand
    const errand = await Errand.create({
      customer: req.user._id,
      type,
      priority,
      pickupLocation,
      dropoffLocation,
      items,
      specialInstructions,
      estimatedDistance: distance,
      estimatedDuration: calculateEstimatedDuration(distance),
      basePrice,
      priorityFee,
      serviceFee,
      totalPrice,
      scheduledFor
    });

    // Notify nearby runners
    await notifyNearbyRunners(errand);

    res.status(201).json({
      status: 'success',
      data: {
        errand
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all errands for a user
exports.getUserErrands = async (req, res) => {
  try {
    const { role } = req.user;
    const query = role === 'customer' ? { customer: req.user._id } : { runner: req.user._id };

    const errands = await Errand.find(query)
      .sort('-createdAt')
      .populate('customer', 'firstName lastName phone')
      .populate('runner', 'firstName lastName phone');

    res.status(200).json({
      status: 'success',
      results: errands.length,
      data: {
        errands
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single errand
exports.getErrand = async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id)
      .populate('customer', 'firstName lastName phone')
      .populate('runner', 'firstName lastName phone');

    if (!errand) {
      return res.status(404).json({
        status: 'error',
        message: 'Errand not found'
      });
    }

    // Check if user has access to this errand
    if (
      errand.customer._id.toString() !== req.user._id.toString() &&
      (!errand.runner || errand.runner._id.toString() !== req.user._id.toString()) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this errand'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        errand
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Accept errand (for runners)
exports.acceptErrand = async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id);

    if (!errand) {
      return res.status(404).json({
        status: 'error',
        message: 'Errand not found'
      });
    }

    if (errand.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This errand is no longer available'
      });
    }

    // Update errand
    errand.runner = req.user._id;
    errand.status = 'accepted';
    await errand.save();

    // Notify customer
    await notifyCustomerOfAcceptance(errand);

    res.status(200).json({
      status: 'success',
      data: {
        errand
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update errand status
exports.updateErrandStatus = async (req, res) => {
  try {
    const { status, location } = req.body;
    const errand = await Errand.findById(req.params.id);

    if (!errand) {
      return res.status(404).json({
        status: 'error',
        message: 'Errand not found'
      });
    }

    // Validate status transition
    if (!isValidStatusTransition(errand.status, status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status transition'
      });
    }

    // Update status and tracking
    errand.status = status;
    if (location) {
      await errand.updateTracking(location, status);
    }

    // Handle status-specific actions
    switch (status) {
      case 'in_progress':
        await notifyCustomerOfProgress(errand);
        break;
      case 'completed':
        errand.completedAt = Date.now();
        await handleErrandCompletion(errand);
        break;
      case 'cancelled':
        errand.cancelledAt = Date.now();
        errand.cancellationBy = req.user.role;
        errand.cancellationReason = req.body.reason;
        await handleErrandCancellation(errand);
        break;
    }

    await errand.save();

    res.status(200).json({
      status: 'success',
      data: {
        errand
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Rate errand
exports.rateErrand = async (req, res) => {
  try {
    const { stars, comment } = req.body;
    const errand = await Errand.findById(req.params.id);

    if (!errand) {
      return res.status(404).json({
        status: 'error',
        message: 'Errand not found'
      });
    }

    if (errand.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Can only rate completed errands'
      });
    }

    if (errand.rating) {
      return res.status(400).json({
        status: 'error',
        message: 'Errand already rated'
      });
    }

    // Update errand rating
    errand.rating = {
      stars,
      comment,
      createdAt: Date.now()
    };
    await errand.save();

    // Update runner's rating
    await updateRunnerRating(errand.runner, stars);

    res.status(200).json({
      status: 'success',
      data: {
        errand
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper functions
const calculateBasePrice = (distance, type) => {
  const baseRate = 500; // NGN per km
  const typeMultiplier = {
    delivery: 1,
    shopping: 1.2,
    document: 1,
    repair: 1.5
  };

  return distance * baseRate * typeMultiplier[type];
};

const calculateEstimatedDuration = (distance) => {
  const averageSpeed = 30; // km/h
  return Math.ceil((distance / averageSpeed) * 60); // in minutes
};

const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    pending: ['accepted', 'cancelled'],
    accepted: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  return validTransitions[currentStatus].includes(newStatus);
};

const notifyNearbyRunners = async (errand) => {
  // Find runners within 5km radius
  const runners = await User.find({
    role: 'runner',
    'runnerProfile.isApproved': true,
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: errand.pickupLocation.coordinates
        },
        $maxDistance: 5000 // 5km in meters
      }
    }
  });

  // Notify each runner
  for (const runner of runners) {
    await sendSMS(
      runner.phone,
      `New errand available near you! Type: ${errand.type}, Distance: ${errand.estimatedDistance}km`
    );
  }
};

const notifyCustomerOfAcceptance = async (errand) => {
  const customer = await User.findById(errand.customer);
  const runner = await User.findById(errand.runner);

  await sendSMS(
    customer.phone,
    `Your errand has been accepted by ${runner.firstName}. They will contact you shortly.`
  );
};

const notifyCustomerOfProgress = async (errand) => {
  const customer = await User.findById(errand.customer);
  const eta = errand.calculateETA();

  await sendSMS(
    customer.phone,
    `Your errand is in progress. Estimated arrival time: ${eta.toLocaleTimeString()}`
  );
};

const handleErrandCompletion = async (errand) => {
  const customer = await User.findById(errand.customer);
  const runner = await User.findById(errand.runner);

  // Update runner's earnings and completed tasks
  runner.runnerProfile.earnings += errand.totalPrice;
  runner.runnerProfile.completedTasks += 1;
  await runner.save();

  // Notify customer
  await sendSMS(
    customer.phone,
    'Your errand has been completed. Please rate your experience.'
  );
};

const handleErrandCancellation = async (errand) => {
  const customer = await User.findById(errand.customer);
  const runner = await User.findById(errand.runner);

  // Handle refund if payment was made
  if (errand.paymentStatus === 'paid') {
    await processRefund(errand);
  }

  // Notify both parties
  await sendSMS(
    customer.phone,
    `Your errand has been cancelled. Reason: ${errand.cancellationReason}`
  );

  if (runner) {
    await sendSMS(
      runner.phone,
      `The errand has been cancelled. Reason: ${errand.cancellationReason}`
    );
  }
};

const updateRunnerRating = async (runnerId, newRating) => {
  const runner = await User.findById(runnerId);
  const { rating, totalRatings } = runner.runnerProfile;

  runner.runnerProfile.rating = ((rating * totalRatings) + newRating) / (totalRatings + 1);
  runner.runnerProfile.totalRatings += 1;
  await runner.save();
}; 
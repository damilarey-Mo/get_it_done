const mongoose = require('mongoose');

const errandSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  runner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['delivery', 'shopping', 'document', 'repair'],
    required: [true, 'Errand type is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['normal', 'priority'],
    default: 'normal'
  },
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    city: {
      type: String,
      required: [true, 'Pickup city is required']
    },
    state: {
      type: String,
      required: [true, 'Pickup state is required']
    },
    country: {
      type: String,
      required: [true, 'Pickup country is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      required: [true, 'Pickup coordinates are required']
    }
  },
  dropoffLocation: {
    address: {
      type: String,
      required: [true, 'Dropoff address is required']
    },
    city: {
      type: String,
      required: [true, 'Dropoff city is required']
    },
    state: {
      type: String,
      required: [true, 'Dropoff state is required']
    },
    country: {
      type: String,
      required: [true, 'Dropoff country is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
      required: [true, 'Dropoff coordinates are required']
    }
  },
  items: [{
    name: {
      type: String,
      required: [true, 'Item name is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required']
    },
    price: {
      type: Number,
      required: [true, 'Item price is required']
    }
  }],
  specialInstructions: String,
  estimatedDistance: {
    type: Number, // in kilometers
    required: [true, 'Estimated distance is required']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required']
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required']
  },
  priorityFee: {
    type: Number,
    default: 0
  },
  serviceFee: {
    type: Number,
    required: [true, 'Service fee is required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'card', 'bank_transfer']
  },
  paymentReference: String,
  rating: {
    stars: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  tracking: [{
    location: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  scheduledFor: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  cancellationBy: {
    type: String,
    enum: ['customer', 'runner', 'admin']
  }
}, {
  timestamps: true
});

// Index for geospatial queries
errandSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
errandSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });

// Virtual for calculating elapsed time
errandSchema.virtual('elapsedTime').get(function() {
  if (!this.createdAt) return 0;
  return Math.floor((Date.now() - this.createdAt) / 1000 / 60); // in minutes
});

// Method to update tracking
errandSchema.methods.updateTracking = async function(location, status) {
  this.tracking.push({
    location,
    status,
    timestamp: Date.now()
  });
  await this.save();
};

// Method to calculate estimated arrival time
errandSchema.methods.calculateETA = function() {
  if (this.status !== 'in_progress') return null;
  
  const lastLocation = this.tracking[this.tracking.length - 1];
  if (!lastLocation) return null;
  
  const distanceToDestination = this.calculateDistance(
    lastLocation.location,
    this.dropoffLocation.coordinates
  );
  
  const averageSpeed = 30; // km/h
  const timeInHours = distanceToDestination / averageSpeed;
  return new Date(Date.now() + timeInHours * 60 * 60 * 1000);
};

// Helper method to calculate distance between two points
errandSchema.methods.calculateDistance = function(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = this.toRad(point2[1] - point1[1]);
  const dLon = this.toRad(point2[0] - point1[0]);
  const lat1 = this.toRad(point1[1]);
  const lat2 = this.toRad(point2[1]);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper method to convert degrees to radians
errandSchema.methods.toRad = function(value) {
  return value * Math.PI / 180;
};

const Errand = mongoose.model('Errand', errandSchema);

module.exports = Errand; 
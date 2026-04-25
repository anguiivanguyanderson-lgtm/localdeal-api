const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    date:    { type: Date, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'done'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
    },
    category: {
      type: String,
      enum: ['cours', 'bricolage', 'livraison', 'garde', 'autre'],
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Le prix est obligatoire'],
      min: 0,
    },
    images: [{ type: String }], // URLs Cloudinary

    location: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
      address:     { type: String, required: true },
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    avgRating:   { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
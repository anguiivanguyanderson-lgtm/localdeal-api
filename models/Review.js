const mongoose = require('mongoose');
const Service  = require('./Service');

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Un utilisateur ne peut laisser qu'un seul avis par service
reviewSchema.index({ author: 1, service: 1 }, { unique: true });

// Après chaque sauvegarde, recalculer la note moyenne du service
reviewSchema.post('save', async function () {
  const result = await mongoose.model('Review').aggregate([
    { $match: { service: this.service } },
    { $group: { _id: '$service', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (result.length > 0) {
    await Service.findByIdAndUpdate(this.service, {
      avgRating:   Math.round(result[0].avg * 10) / 10,
      reviewCount: result[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
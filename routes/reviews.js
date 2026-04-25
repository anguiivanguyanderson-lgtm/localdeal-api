const express = require('express');
const Review  = require('../models/Review');
const Booking = require('../models/Booking');
const protect = require('../middleware/protect');

const router = express.Router();

// GET /api/reviews/service/:serviceId — avis d'un service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews — laisser un avis (doit avoir une réservation "done")
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    // Vérifier que le client a bien utilisé ce service
    const validBooking = await Booking.findOne({
      client:  req.user.id,
      service: serviceId,
      status:  'done',
    });
    if (!validBooking)
      return res.status(403).json({
        success: false,
        message: 'Vous devez avoir complété une réservation pour laisser un avis',
      });

    const review = await Review.create({
      author:  req.user.id,
      service: serviceId,
      rating,
      comment,
    });

    await review.populate('author', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Vous avez déjà laissé un avis pour ce service' });
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/reviews/:id — supprimer son avis
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Avis introuvable' });
    if (review.author.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    await review.deleteOne();
    res.json({ success: true, message: 'Avis supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
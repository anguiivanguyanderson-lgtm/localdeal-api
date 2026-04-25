const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const protect = require('../middleware/protect');

const router = express.Router();

// POST /api/bookings — faire une demande de réservation
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId, date, message } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service introuvable' });
    if (service.provider.toString() === req.user.id)
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas réserver votre propre service' });

    const booking = await Booking.create({
      client:  req.user.id,
      service: serviceId,
      date,
      message,
    });

    await booking.populate([
      { path: 'client',  select: 'name email' },
      { path: 'service', select: 'title price' },
    ]);

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/mine — réservations du client connecté
router.get('/mine', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.user.id })
      .populate('service', 'title price images category')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/received — demandes reçues par le prestataire
router.get('/received', protect, async (req, res) => {
  try {
    // Trouver tous les services du prestataire connecté
    const myServices = await Service.find({ provider: req.user.id }).select('_id');
    const serviceIds = myServices.map(s => s._id);

    const bookings = await Booking.find({ service: { $in: serviceIds } })
      .populate('client',  'name email avatar')
      .populate('service', 'title price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id/status — changer le statut (prestataire)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'cancelled', 'done'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });

    const booking = await Booking.findById(req.params.id).populate('service');
    if (!booking) return res.status(404).json({ success: false, message: 'Réservation introuvable' });

    // Seul le prestataire du service peut changer le statut
    if (booking.service.provider.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    booking.status = status;
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/bookings/:id — annuler sa réservation (client, si encore pending)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Réservation introuvable' });
    if (booking.client.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    if (booking.status !== 'pending')
      return res.status(400).json({ success: false, message: 'Impossible d\'annuler une réservation déjà traitée' });

    await booking.deleteOne();
    res.json({ success: true, message: 'Réservation annulée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
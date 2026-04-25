const express = require('express');
const Service = require('../models/Service');
const protect = require('../middleware/protect');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/services — liste avec filtres + pagination
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, minRating, sort, page = 1, limit = 10, search } = req.query;

    const filter = { isActive: true };
    if (category)  filter.category  = category;
    if (minRating) filter.avgRating = { $gte: Number(minRating) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const sortOptions = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { avgRating: -1 },
      newest:     { createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Service.countDocuments(filter);

    const services = await Service.find(filter)
      .populate('provider', 'name avatar bio')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
      data:  services,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/services/nearby — services proches par géolocalisation
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, radius = 10000, category } = req.query; // radius en mètres

    if (!lng || !lat)
      return res.status(400).json({ success: false, message: 'lng et lat sont requis' });

    const filter = {
      isActive: true,
      location: {
        $near: {
          $geometry:    { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius),
        },
      },
    };
    if (category) filter.category = category;

    const services = await Service.find(filter)
      .populate('provider', 'name avatar')
      .limit(20);

    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/services/:id — détail d'un service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name avatar bio location');
    if (!service) return res.status(404).json({ success: false, message: 'Service introuvable' });
    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/services — créer un service (provider uniquement)
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'provider')
      return res.status(403).json({ success: false, message: 'Réservé aux prestataires' });

    const images = req.files ? req.files.map(f => f.path) : [];
    const location = typeof req.body.location === 'string'
      ? JSON.parse(req.body.location)
      : req.body.location;

    const service = await Service.create({
      ...req.body,
      location,
      images,
      provider: req.user.id,
    });

    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/services/:id — modifier son service
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service introuvable' });
    if (service.provider.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    const newImages = req.files?.map(f => f.path) || [];
    const updates   = { ...req.body };
    if (newImages.length) updates.images = [...service.images, ...newImages];
    if (typeof updates.location === 'string') updates.location = JSON.parse(updates.location);

    const updated = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/services/:id — désactiver (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service introuvable' });
    if (service.provider.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Non autorisé' });

    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Service désactivé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
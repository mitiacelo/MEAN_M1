// routes/maintenance.js
const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Shop = require('../models/Shop');

// ── GET /maintenance → tous les tickets (admin)
router.get('/', async (req, res) => {
  try {
    const { statut, priorite, shopId } = req.query;
    const filter = {};
    if (statut)   filter.statut = statut;
    if (priorite) filter.priorite = priorite;
    if (shopId)   filter.shop = shopId;

    const tickets = await Maintenance.find(filter)
      .populate('shop', 'name superficie')
      .populate('signalePar', 'name firstname email role')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /maintenance/stats → compteurs pour le dashboard header
router.get('/stats', async (req, res) => {
  try {
    const [total, urgents, enCours, resolusThisMois] = await Promise.all([
      Maintenance.countDocuments({ statut: { $in: ['ouvert', 'en_cours'] } }),
      Maintenance.countDocuments({ statut: 'ouvert', priorite: 'urgent' }),
      Maintenance.countDocuments({ statut: 'en_cours' }),
      Maintenance.countDocuments({
        statut: 'résolu',
        dateResolution: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    ]);
    res.json({ total, urgents, enCours, resolusThisMois });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /maintenance/:id → détail d'un ticket
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Maintenance.findById(req.params.id)
      .populate('shop', 'name superficie description')
      .populate('signalePar', 'name firstname email role');
    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /maintenance → créer un ticket (manager ou admin)
router.post('/', async (req, res) => {
  try {
    const { shopId, userId, titre, description, categorie, priorite } = req.body;
    const ticket = new Maintenance({
      shop: shopId,
      signalePar: userId,
      titre,
      description,
      categorie: categorie || 'autre',
      priorite: priorite || 'normal'
    });
    await ticket.save();
    const populated = await ticket.populate([
      { path: 'shop', select: 'name superficie' },
      { path: 'signalePar', select: 'name firstname email role' }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /maintenance/:id/statut → changer le statut (admin)
router.patch('/:id/statut', async (req, res) => {
  try {
    const { statut, noteResolution, dateIntervention } = req.body;
    const update = { statut };
    if (noteResolution !== undefined) update.noteResolution = noteResolution;
    if (dateIntervention !== undefined) update.dateIntervention = dateIntervention || null;
    if (statut === 'résolu') update.dateResolution = new Date();

    const ticket = await Maintenance.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('shop', 'name superficie')
      .populate('signalePar', 'name firstname email role');

    if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE /maintenance/:id → supprimer (admin)
router.delete('/:id', async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
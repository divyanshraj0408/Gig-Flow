const express = require('express');
const Gig = require('../models/Gig');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/gigs
// @desc    Get all gigs with search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, status = 'open' } = req.query;
    
    let query = { status };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: gigs.length,
      gigs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/gigs/:id
// @desc    Get single gig
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('ownerId', 'name email');

    if (!gig) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }

    res.json({
      success: true,
      gig
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/gigs
// @desc    Create new gig
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    const gig = await Gig.create({
      title,
      description,
      budget,
      ownerId: req.user._id
    });

    res.status(201).json({
      success: true,
      gig
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/gigs/my/posted
// @desc    Get gigs posted by current user
// @access  Private
router.get('/my/posted', protect, async (req, res) => {
  try {
    const gigs = await Gig.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: gigs.length,
      gigs
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
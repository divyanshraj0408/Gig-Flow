const express = require('express');
const mongoose = require('mongoose');
const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bids
// @desc    Submit a bid for a gig
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ 
        success: false, 
        message: 'This gig is no longer accepting bids' 
      });
    }

    // Prevent bidding on own gig
    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot bid on your own gig' 
      });
    }

    // Check if user already bid
    const existingBid = await Bid.findOne({ 
      gigId, 
      freelancerId: req.user._id 
    });

    if (existingBid) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted a bid for this gig' 
      });
    }

    // Create bid
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    await bid.populate('freelancerId', 'name email');

    res.status(201).json({
      success: true,
      bid
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/bids/:gigId
// @desc    Get all bids for a specific gig (Owner only)
// @access  Private
router.get('/:gigId', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    
    if (!gig) {
      return res.status(404).json({ 
        success: false, 
        message: 'Gig not found' 
      });
    }

    // Only gig owner can see bids
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view these bids' 
      });
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   PATCH /api/bids/:bidId/hire
// @desc    Hire a freelancer (ATOMIC OPERATION WITH TRANSACTION)
// @access  Private
router.patch('/:bidId/hire', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the bid with session
    const bid = await Bid.findById(req.params.bidId)
      .populate('gigId')
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'Bid not found' 
      });
    }

    const gig = bid.gigId;

    // Verify ownership
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to hire for this gig' 
      });
    }

    // Check if gig is still open (prevents race condition)
    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: 'This gig has already been assigned' 
      });
    }

    // Atomic updates within transaction
    // 1. Update the gig status to 'assigned'
    await Gig.findByIdAndUpdate(
      gig._id,
      { status: 'assigned' },
      { session }
    );

    // 2. Update the selected bid to 'hired'
    await Bid.findByIdAndUpdate(
      bid._id,
      { status: 'hired' },
      { session }
    );

    // 3. Update all other bids for this gig to 'rejected'
    await Bid.updateMany(
      { 
        gigId: gig._id, 
        _id: { $ne: bid._id }, 
        status: 'pending' 
      },
      { status: 'rejected' },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();

    // Fetch updated bid
    const updatedBid = await Bid.findById(bid._id)
      .populate('freelancerId', 'name email')
      .populate('gigId');

    res.json({
      success: true,
      message: 'Freelancer hired successfully',
      bid: updatedBid
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  } finally {
    session.endSession();
  }
});

// @route   GET /api/bids/my/submissions
// @desc    Get bids submitted by current user
// @access  Private
router.get('/my/submissions', protect, async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
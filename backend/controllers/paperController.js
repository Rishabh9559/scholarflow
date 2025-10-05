const Paper = require('../models/Paper');

// @desc    Get all papers for logged in user
// @route   GET /api/papers
// @access  Private
exports.getPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching papers',
      error: error.message
    });
  }
};

// @desc    Get single paper
// @route   GET /api/papers/:id
// @access  Private
exports.getPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Make sure user owns the paper
    if (paper.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this paper'
      });
    }

    res.status(200).json({
      success: true,
      data: paper
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching paper',
      error: error.message
    });
  }
};

// @desc    Create new paper
// @route   POST /api/papers
// @access  Private
exports.createPaper = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const paper = await Paper.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Paper created successfully',
      data: paper
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating paper',
      error: error.message
    });
  }
};

// @desc    Update paper
// @route   PUT /api/papers/:id
// @access  Private
exports.updatePaper = async (req, res) => {
  try {
    let paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Make sure user owns the paper
    if (paper.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this paper'
      });
    }

    paper = await Paper.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Paper updated successfully',
      data: paper
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating paper',
      error: error.message
    });
  }
};

// @desc    Delete paper
// @route   DELETE /api/papers/:id
// @access  Private
exports.deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Make sure user owns the paper
    if (paper.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this paper'
      });
    }

    await paper.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Paper deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting paper',
      error: error.message
    });
  }
};

// @desc    Get papers by status
// @route   GET /api/papers/status/:status
// @access  Private
exports.getPapersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const papers = await Paper.find({
      user: req.user.id,
      status: status
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching papers by status',
      error: error.message
    });
  }
};

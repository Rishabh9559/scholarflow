const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Paper = require('../models/Paper');
const { generateIEEELatex } = require('../services/latexGenerator');


router.get('/ieee/:paperId', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if paper belongs to user
    if (paper.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this paper'
      });
    }

    // Generate LaTeX document
    const latexContent = generateIEEELatex(paper);

    // Set headers for file download
    const filename = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ieee.tex`;
    
    res.setHeader('Content-Type', 'application/x-tex');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.status(200).send(latexContent);
  } catch (error) {
    console.error('Error generating IEEE LaTeX:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating IEEE format',
      error: error.message
    });
  }
});


router.get('/preview/ieee/:paperId', protect, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.paperId);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    // Check if paper belongs to user
    if (paper.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this paper'
      });
    }

    // Generate LaTeX document
    const latexContent = generateIEEELatex(paper);

    res.status(200).json({
      success: true,
      data: {
        format: 'IEEE',
        paperId: paper._id,
        paperTitle: paper.title,
        content: latexContent
      }
    });
  } catch (error) {
    console.error('Error previewing IEEE LaTeX:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating IEEE preview',
      error: error.message
    });
  }
});



module.exports = router;

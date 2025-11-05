const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Paper = require('../models/Paper');
const { generateIEEELatex } = require('../services/latexGenerator');
const { generatePdfFromLatex, cleanupLatexArtifacts } = require('../services/pdfCompiler');


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

router.get('/ieee/pdf/:paperId', protect, async (req, res) => {
  let cleanup;

  try {
    const paper = await Paper.findById(req.params.paperId);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }

    if (paper.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this paper'
      });
    }

    const latexContent = generateIEEELatex(paper);
    const pdfResult = await generatePdfFromLatex(
      latexContent,
      `${paper.title || 'paper'}_ieee`
    );

    cleanup = pdfResult.cleanup;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
    return res.status(200).send(pdfResult.pdfBuffer);
  } catch (error) {
    console.error('Error generating IEEE PDF:', error);

    const message =
      error.message === 'No LaTeX content provided for PDF generation'
        ? 'No content available to generate PDF'
        : 'Error generating IEEE PDF';

    return res.status(500).json({
      success: false,
      message,
      error: error.stderr || error.message
    });
  } finally {
    if (cleanup) {
      try {
        await cleanup();
      } catch (cleanupError) {
        console.warn('Failed to clean temporary LaTeX artifacts:', cleanupError);
      }
    }

    await cleanupLatexArtifacts();
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

const express = require('express');
const {
  getPapers,
  getPaper,
  createPaper,
  updatePaper,
  deletePaper,
  getPapersByStatus
} = require('../controllers/paperController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getPapers)
  .post(createPaper);

router.route('/:id')
  .get(getPaper)
  .put(updatePaper)
  .delete(deletePaper);

router.route('/status/:status')
  .get(getPapersByStatus);

module.exports = router;

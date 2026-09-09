const express = require('express');
const { authenticate } = require('../middleware/auth');
const { uploadGigImage } = require('../middleware/upload');
const {
  listGigs,
  getGig,
  createGig,
  updateGig,
  deleteGig,
  myGigs,
  uploadImage,
} = require('../controllers/gigController');

const router = express.Router();

router.get('/', listGigs);
router.get('/mine', authenticate, myGigs); // must come before /:id
router.get('/:id', getGig);
router.post('/', authenticate, createGig);
router.put('/:id', authenticate, updateGig);
router.delete('/:id', authenticate, deleteGig);
router.post('/:id/image', authenticate, uploadGigImage, uploadImage);

module.exports = router;

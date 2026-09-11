const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { listCategories, createCategory, seedDefaults } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', listCategories);
router.get('/seed-defaults', seedDefaults);
router.post('/', authenticate, requireAdmin, createCategory);

module.exports = router;
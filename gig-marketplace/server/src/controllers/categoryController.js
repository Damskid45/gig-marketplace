const { Category } = require('../models');

async function listCategories(req, res, next) {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

// GET /api/categories/seed-defaults?secret=...
// One-time-use helper for populating default categories on a fresh deploy.
// Protected by a secret, and safe to call more than once - it does nothing
// if categories already exist.
async function seedDefaults(req, res, next) {
  try {
    if (!process.env.SEED_SECRET || req.query.secret !== process.env.SEED_SECRET) {
      return res.status(403).json({ message: 'Invalid or missing secret' });
    }

    const existingCount = await Category.count();
    if (existingCount > 0) {
      return res.json({ message: 'Categories already exist, nothing to do', count: existingCount });
    }

    const created = await Category.bulkCreate([
      { name: 'Development' },
      { name: 'Design' },
      { name: 'Writing' },
      { name: 'Audio' },
      { name: 'Marketing' },
    ]);

    res.json({ message: 'Default categories created', count: created.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, createCategory, seedDefaults };
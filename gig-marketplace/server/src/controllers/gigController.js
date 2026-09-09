const { Op } = require('sequelize');
const { Gig, User, Category, Order, Review } = require('../models');

function withAvgRating(gig) {
  const reviews = (gig.Orders || [])
    .map((o) => o.Review)
    .filter(Boolean);
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;
  const plain = gig.toJSON ? gig.toJSON() : gig;
  delete plain.Orders;
  return { ...plain, avgRating: avg, reviewCount: reviews.length };
}

// GET /api/gigs?search=logo&categoryId=...&minPrice=&maxPrice=
async function listGigs(req, res, next) {
  try {
    const { search, categoryId, minPrice, maxPrice } = req.query;
    const where = { isActive: true };

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    if (categoryId) where.categoryId = categoryId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const gigs = await Gig.findAll({
      where,
      include: [
        { model: User, as: 'freelancer', attributes: ['id', 'name', 'title'] },
        { model: Category, attributes: ['id', 'name'] },
        { model: Order, attributes: ['id'], include: [{ model: Review, attributes: ['rating'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(gigs.map(withAvgRating));
  } catch (err) {
    next(err);
  }
}

async function getGig(req, res, next) {
  try {
    const gig = await Gig.findByPk(req.params.id, {
      include: [
        { model: User, as: 'freelancer', attributes: ['id', 'name', 'title', 'bio'] },
        { model: Category, attributes: ['id', 'name'] },
        {
          model: Order,
          attributes: ['id'],
          include: [
            { model: Review, attributes: ['rating', 'comment', 'createdAt'] },
          ],
        },
      ],
    });
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    res.json(withAvgRating(gig));
  } catch (err) {
    next(err);
  }
}

async function createGig(req, res, next) {
  try {
    const { title, description, price, deliveryDays, categoryId } = req.body;
    const gig = await Gig.create({
      title,
      description,
      price,
      deliveryDays,
      categoryId,
      freelancerId: req.user.id,
    });
    res.status(201).json(gig);
  } catch (err) {
    next(err);
  }
}

async function updateGig(req, res, next) {
  try {
    const gig = await Gig.findByPk(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: not your gig' });
    }
    await gig.update(req.body);
    res.json(gig);
  } catch (err) {
    next(err);
  }
}

async function deleteGig(req, res, next) {
  try {
    const gig = await Gig.findByPk(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: not your gig' });
    }
    await gig.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function uploadImage(req, res, next) {
  try {
    const gig = await Gig.findByPk(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found' });
    if (gig.freelancerId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: not your gig' });
    }
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    const imageUrl = `/uploads/gigs/${req.file.filename}`;
    await gig.update({ imageUrl });
    res.json({ imageUrl });
  } catch (err) {
    next(err);
  }
}

async function myGigs(req, res, next) {
  try {
    const gigs = await Gig.findAll({
      where: { freelancerId: req.user.id },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(gigs);
  } catch (err) {
    next(err);
  }
}

module.exports = { listGigs, getGig, createGig, updateGig, deleteGig, myGigs, uploadImage };

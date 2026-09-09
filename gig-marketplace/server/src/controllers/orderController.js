const { Order, Gig, User, Review } = require('../models');

async function createOrder(req, res, next) {
  try {
    const { gigId, requirements } = req.body;

    const gig = await Gig.findByPk(gigId);
    if (!gig || !gig.isActive) return res.status(404).json({ message: 'Gig not found' });

    if (gig.freelancerId === req.user.id) {
      return res.status(400).json({ message: 'You cannot order your own gig' });
    }

    const order = await Order.create({
      gigId,
      buyerId: req.user.id,
      price: gig.price, // snapshot
      requirements,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// Orders where the user is the buyer
async function myOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.user.id },
      include: [
        { model: Gig, include: [{ model: User, as: 'freelancer', attributes: ['id', 'name'] }] },
        Review,
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// Orders for gigs the user owns (as a freelancer, i.e. incoming orders)
async function incomingOrders(req, res, next) {
  try {
    const orders = await Order.findAll({
      include: [
        { model: Gig, where: { freelancerId: req.user.id } },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
        Review,
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Gig, include: [{ model: User, as: 'freelancer', attributes: ['id', 'name'] }] },
        { model: User, as: 'buyer', attributes: ['id', 'name'] },
        Review,
      ],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isBuyer = order.buyerId === req.user.id;
    const isFreelancer = order.Gig.freelancerId === req.user.id;
    if (!isBuyer && !isFreelancer && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

// Freelancer updates status: in_progress -> delivered. Buyer confirms -> completed. Either can cancel.
async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByPk(req.params.id, { include: [Gig] });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isBuyer = order.buyerId === req.user.id;
    const isFreelancer = order.Gig.freelancerId === req.user.id;
    if (!isBuyer && !isFreelancer && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Only the freelancer can mark in_progress/delivered; only buyer can mark completed
    if (['in_progress', 'delivered'].includes(status) && !isFreelancer && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only the freelancer can set this status' });
    }
    if (status === 'in_progress' && !order.isPaid && !req.user.isAdmin) {
      return res.status(402).json({ message: 'This order has not been paid for yet' });
    }
    if (status === 'completed' && !isBuyer && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only the buyer can mark an order completed' });
    }

    await order.update({ status });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

// Buyer leaves a review after the order is completed
async function leaveReview(req, res, next) {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findByPk(req.params.id, { include: [Review] });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.buyerId !== req.user.id) {
      return res.status(403).json({ message: 'Only the buyer can review this order' });
    }
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Order must be completed before it can be reviewed' });
    }
    if (order.Review) {
      return res.status(409).json({ message: 'This order already has a review' });
    }

    const review = await Review.create({
      orderId: order.id,
      reviewerId: req.user.id,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  myOrders,
  incomingOrders,
  getOrder,
  updateOrderStatus,
  leaveReview,
};

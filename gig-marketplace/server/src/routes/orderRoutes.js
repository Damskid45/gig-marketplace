const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  createOrder,
  myOrders,
  incomingOrders,
  getOrder,
  updateOrderStatus,
  leaveReview,
} = require('../controllers/orderController');

const router = express.Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/mine', myOrders); // as buyer
router.get('/incoming', incomingOrders); // as freelancer
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/review', leaveReview);

module.exports = router;

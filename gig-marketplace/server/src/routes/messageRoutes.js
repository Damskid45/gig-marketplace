const express = require('express');
const { authenticate } = require('../middleware/auth');
const { sendMessage, listConversations, getThread } = require('../controllers/messageController');

const router = express.Router();

router.use(authenticate);

router.post('/', sendMessage);
router.get('/conversations', listConversations);
router.get('/with/:userId', getThread);

module.exports = router;

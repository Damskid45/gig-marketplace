const { Op } = require('sequelize');
const { Message, User, Gig } = require('../models');

async function sendMessage(req, res, next) {
  try {
    const { receiverId, body, gigId } = req.body;

    if (receiverId === req.user.id) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) return res.status(404).json({ message: 'Recipient not found' });

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      body,
      gigId: gigId || null,
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

// List distinct conversations (grouped by the other participant) with the last message
async function listConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const messages = await Message.findAll({
      where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name'] },
        { model: User, as: 'receiver', attributes: ['id', 'name'] },
        { model: Gig, attributes: ['id', 'title'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const conversationsByPartner = new Map();
    for (const m of messages) {
      const partnerId = m.senderId === userId ? m.receiverId : m.senderId;
      if (!conversationsByPartner.has(partnerId)) {
        const partner = m.senderId === userId ? m.receiver : m.sender;
        conversationsByPartner.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          lastMessage: m.body,
          lastMessageAt: m.createdAt,
          gig: m.Gig || null,
        });
      }
    }

    res.json(Array.from(conversationsByPartner.values()));
  } catch (err) {
    next(err);
  }
}

// GET /api/messages/with/:userId - full thread with one other user
async function getThread(req, res, next) {
  try {
    const userId = req.user.id;
    const partnerId = req.params.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    // mark messages sent to me as read
    await Message.update(
      { readAt: new Date() },
      { where: { senderId: partnerId, receiverId: userId, readAt: null } }
    );

    res.json(messages);
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, listConversations, getThread };

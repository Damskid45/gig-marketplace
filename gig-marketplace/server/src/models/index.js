const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');
const Gig = require('./Gig');
const Order = require('./Order');
const Message = require('./Message');
const Review = require('./Review');
const Payment = require('./Payment');

// A gig belongs to a freelancer (User) and a category
User.hasMany(Gig, { as: 'gigs', foreignKey: 'freelancerId', onDelete: 'CASCADE' });
Gig.belongsTo(User, { as: 'freelancer', foreignKey: 'freelancerId' });

Category.hasMany(Gig, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Gig.belongsTo(Category, { foreignKey: 'categoryId' });

// An order is placed by a buyer (User) for a gig
User.hasMany(Order, { as: 'purchases', foreignKey: 'buyerId', onDelete: 'CASCADE' });
Order.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });

Gig.hasMany(Order, { foreignKey: 'gigId', onDelete: 'CASCADE' });
Order.belongsTo(Gig, { foreignKey: 'gigId' });

// Messages between two users (optionally about a gig)
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'senderId', onDelete: 'CASCADE' });
User.hasMany(Message, { as: 'receivedMessages', foreignKey: 'receiverId', onDelete: 'CASCADE' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
Gig.hasMany(Message, { foreignKey: 'gigId', onDelete: 'SET NULL' });
Message.belongsTo(Gig, { foreignKey: 'gigId' });

// A review is left by the buyer on a completed order
Order.hasOne(Review, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Review.belongsTo(Order, { foreignKey: 'orderId' });
User.hasMany(Review, { as: 'reviewsWritten', foreignKey: 'reviewerId', onDelete: 'CASCADE' });
Review.belongsTo(User, { as: 'reviewer', foreignKey: 'reviewerId' });

// A payment is tied to a single order
Order.hasOne(Payment, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = { sequelize, User, Category, Gig, Order, Message, Review, Payment };

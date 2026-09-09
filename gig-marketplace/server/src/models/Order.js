const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'delivered', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  price: {
    // snapshot of the gig price at time of order, in case the gig price changes later
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  requirements: {
    type: DataTypes.TEXT, // client's notes on what they need
    allowNull: true,
  },
  isPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;

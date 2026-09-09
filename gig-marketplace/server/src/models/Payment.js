const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reference: {
    // Paystack transaction reference - unique, used for idempotency
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    // stored in the smallest currency unit (kobo), matching Paystack's convention
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'NGN',
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    defaultValue: 'pending',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true,
});

module.exports = Payment;

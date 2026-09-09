const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'messages',
  timestamps: true,
});

module.exports = Message;

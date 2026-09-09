const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Gig = sequelize.define('Gig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  deliveryDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'gigs',
  timestamps: true,
});

module.exports = Gig;

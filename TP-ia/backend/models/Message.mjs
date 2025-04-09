// backend/models/Message.mjs
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.mjs';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'conversations',
      key: 'id',
    },
  },
  sender: {
    type: DataTypes.ENUM('user', 'gpt'),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'message',
  timestamps: false,
});

export default Message;
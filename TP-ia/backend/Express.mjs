// backend/Express.mjs
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import conversationRoutes from './routes/conversationRoutes.mjs';
import sequelize from './config/database.mjs';
import Conversation from './models/Conversation.mjs';
import Message from './models/Message.mjs';
import User from './models/User.mjs';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/conversations', conversationRoutes);

// Define associations
Conversation.hasMany(Message, { as: 'Messages', foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
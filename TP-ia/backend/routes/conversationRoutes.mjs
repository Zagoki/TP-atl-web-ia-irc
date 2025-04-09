// backend/routes/conversationRoutes.mjs
import express from 'express';
import { addMessage, getConversations, createConversation } from '../controllers/conversationController.mjs';

const router = express.Router();

router.post('/message', addMessage);
router.get('/', getConversations);
router.post('/', createConversation);

export default router;
// backend/controllers/conversationController.mjs
import fetch from 'node-fetch';
import Conversation from '../models/Conversation.mjs';
import Message from '../models/Message.mjs';

const addMessage = async (req, res) => {
  const { inputText, conversationId } = req.body;
  const MODEL_NAME = "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B";

  try {
    // Save the user's message
    await Message.create({
      conversationId,
      sender: 'user',
      message: inputText,
    });

    // Fetch the response from the AI model
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: inputText }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result[0].generated_text;

    // Save the AI's response
    await Message.create({
      conversationId,
      sender: 'gpt',
      message: aiResponse,
    });

    res.json({ message: aiResponse, reasoning: result[0].reasoning });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      include: [{
        model: Message,
        as: 'Messages'
      }],
    });
    res.json(conversations);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

const createConversation = async (req, res) => {
  const { title } = req.body;

  try {
    const conversation = await Conversation.create({ title });
    res.json(conversation);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
};

export { addMessage, getConversations, createConversation };
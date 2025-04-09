let currentConversationId = null;

async function sendMessage() {
  const userInputField = document.getElementById('user-input');
  const userInput = userInputField.value.trim();
  if (!userInput || !currentConversationId) return;

  const chatBox = document.getElementById('chat-box');
  appendMessage(`Vous: ${userInput}`, 'user');

  userInputField.value = '';

  try {
    const response = await fetch('http://localhost:5000/api/conversations/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputText: userInput, conversationId: currentConversationId })
    });

    if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);

    const result = await response.json();
    const cleanedResult = cleanText(result.message || "Pas de réponse");
    appendMessage(`IA: ${cleanedResult}`, 'ai');

    // Display reasoning
    const reasoning = document.getElementById('reasoning');
    reasoning.textContent = `Raisonnement: ${result.reasoning}`;
  } catch (error) {
    console.error('Erreur:', error);
    appendMessage("IA : Désolé, une erreur est survenue.", 'error');
  }
}

async function loadConversations() {
  try {
    const response = await fetch('http://localhost:5000/api/conversations');
    const conversations = await response.json();
    const conversationList = document.getElementById('conversation-list');
    conversationList.innerHTML = '';

    conversations.forEach(conversation => {
      const conversationDiv = document.createElement('div');
      conversationDiv.classList.add('conversation');
      conversationDiv.innerHTML = `<h3>${conversation.title}</h3>`;
      conversationDiv.onclick = () => showConversationDetails(conversation);

      conversationList.appendChild(conversationDiv);
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

async function createConversation(event) {
  event.preventDefault();
  const title = document.getElementById('new-conversation-title').value.trim();
  if (!title) return;

  try {
    const response = await fetch('http://localhost:5000/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });

    if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);

    loadConversations();
    document.getElementById('new-conversation-title').value = '';
  } catch (error) {
    console.error('Erreur:', error);
  }
}

function showConversationDetails(conversation) {
  currentConversationId = conversation.id;
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML = '';

  conversation.Messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', message.sender);
    messageDiv.textContent = message.message;
    chatBox.appendChild(messageDiv);
  });
}

function cleanText(text) {
  return text.replace(/<think>.*?<\/think>/gs, '').trim();
}

function appendMessage(text, type) {
  const chatBox = document.getElementById('chat-box');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', type);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function toggleReasoning() {
  const reasoning = document.getElementById('reasoning');
  if (reasoning.style.display === 'none') {
    reasoning.style.display = 'block';
  } else {
    reasoning.style.display = 'none';
  }
}

// Load conversations on page load
window.onload = loadConversations;
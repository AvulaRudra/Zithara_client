import React, { useState } from 'react';
import axios from 'axios';
import ChatMessage from './ChatMessage';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId] = useState(Date.now().toString());

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setTyping(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        'http://localhost:5000/api/chat/query',
        { message: input, sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const botMessage = { text: response.data.reply, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: 'Error: Could not get response', sender: 'bot' }]);
    } finally {
      setTyping(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Customer Assistant</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="chat-history">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}
        {typing && <p className="typing">Typing...</p>}
      </div>
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your query..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const sessionId = 'user123'; // Hardcoded for simplicity

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/history/${sessionId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        sessionId,
      });
      const botMessage = { 
        role: 'assistant', 
        content: response.data.reply, 
        timestamp: Date.now(), 
        source: response.data.source 
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error occurred', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <h2>Customer Query Assistant</h2>
        <div className="chat-history">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.content}
              {msg.source && <span className="source"> (via {msg.source})</span>}
            </div>
          ))}
          {isTyping && <div className="typing">Bot is typing...</div>}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about products, orders, or refunds..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
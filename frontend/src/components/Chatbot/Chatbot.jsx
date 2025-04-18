// Chatbot.jsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import './Chatbot.css';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';

const Chatbot = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const stored = sessionStorage.getItem('chatbotMessages');
    return stored ? JSON.parse(stored) : [
      { sender: 'bot', text: 'Hi there! How can I help you today?' },
    ];
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Save messages on update
  useEffect(() => {
    sessionStorage.setItem('chatbotMessages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Expose resetChat to parent
  useImperativeHandle(ref, () => ({
    resetChat() {
      sessionStorage.removeItem('chatbotMessages');
      setMessages([{ sender: 'bot', text: 'Hi there! How can I help you today?' }]);
    }
  }));

  const handleSend = async () => {
    if (input.trim() === '') return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:4000/api/gemini/chat', {
        message: input,
      });

      const botReply = {
        sender: 'bot',
        text: response.data.reply || 'Thanks for your message! 😊',
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, {
        sender: 'bot',
        text: "Sorry, I'm having trouble. Please try again later.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header" onClick={() => setIsOpen(!isOpen)}>
          <FaRobot />
          <span>How Can I Assist You?</span>
        </div>

        {isOpen && (
          <div className="chatbot-body">
            <div className="chatbot-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chatbot-message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              {isTyping && (
                <div className="chatbot-message bot">
                  <span>...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} disabled={!input.trim()}>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Chatbot;

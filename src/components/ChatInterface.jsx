// src/components/ChatInterface.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
const BASE_URL = "https://auto-researcher-node-api.onrender.com"
const Message = ({ message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] p-3 rounded-lg ${
      message.sender === 'user' 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      <p className="whitespace-pre-wrap">{message.text}</p>
    </div>
  </div>
);

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(['user', 'ai']).isRequired
  }).isRequired
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try{
      const response = await fetch(`${BASE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.response || 'Failed to process query');
      }

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}`,
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">AI Chat</h2>
        <p className="text-gray-600">Ask questions about your transcriptions</p>
      </div>
      <div className="h-[400px] overflow-y-auto rounded-xl bg-gray-50 p-4">
        <div className="space-y-4">
          {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white shadow-md'
                }`}>
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Start a conversation by asking a question
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="relative">
        <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-6 py-4 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
            placeholder="Type your question..."
            disabled={loading}
        />
        <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
         >
           {loading ? '...' : 'Send'}
         </button>
      </form>
    </div>
  );
};

export default ChatInterface;
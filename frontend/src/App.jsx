import { useState, useRef, useEffect } from 'react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am DeskMate, your AI IT Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [traces, setTraces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef(null);
  const tracesEndRef = useRef(null);

  // Auto-scroll to bottom of chat and traces
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    tracesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [traces]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send previous messages (excluding the default greeting) as context
        body: JSON.stringify({ message: userMsg, history: messages.slice(1) })
      });
      
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      setTraces(prev => [...prev, ...data.traces, '----------------------------------------']);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error: Could not connect to the DeskMate backend.' }]);
      setTraces(prev => [...prev, `[ERROR] ${error.message}`, '----------------------------------------']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      
      {/* Left Panel: Chat Interface */}
      <div className="chat-panel">
        <div className="chat-header">
          DeskMate IT Helpdesk
        </div>
        
        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role === 'user' ? 'user' : 'bot'}`}>
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-row bot">
              <div className="message-bubble thinking">
                Thinking and executing tools...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={sendMessage} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I need Adobe Creative Suite. If I'm not entitled, open a ticket."
            className="chat-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="chat-send-btn"
          >
            Send
          </button>
        </form>
      </div>

      {/* Right Panel: Observability Traces */}
      <div className="trace-panel">
        <h2 className="trace-header">Agent Execution Traces</h2>
        {traces.map((trace, idx) => (
          <div key={idx} className="trace-line">{trace}</div>
        ))}
        <div ref={tracesEndRef} />
      </div>
    </div>
  );
}

export default App;
import { useState, useRef, useEffect } from 'react';
import { sendAIChatMessage } from '../api';

export default function AskAI({ workerData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    // Initial greeting when opened first time
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'model', text: "Hi! I'm your ShadowCredit AI Assistant. You can ask me anything about this worker's score or insights." }]);
        }
    }, [isOpen, messages]);

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !workerData) return;

        const userMsg = input.trim();
        setInput('');
        
        const newHistory = [...messages, { role: 'user', text: userMsg }];
        setMessages(newHistory);
        setLoading(true);

        try {
            // we only pass up to last 10 messages for context
            const apiHistory = newHistory.slice(-10);
            const res = await sendAIChatMessage(workerData, apiHistory.slice(0, -1), userMsg);
            setMessages(prev => [...prev, { role: 'model', text: res.text }]);
        } catch (error) {
            console.error("Chat Error", error);
            setMessages(prev => [...prev, { role: 'model', text: "⚠ Sorry, I encountered an error connecting to the AI service." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button className="chat-fab-button" onClick={() => setIsOpen(true)}>
                <span>✨ Ask AI</span>
            </button>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-title flex items-center gap-2">
                    <span>🤖</span> AI Assistant
                </div>
                <button className="chat-close" onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className="chat-body">
                {messages.map((m, idx) => (
                    <div key={idx} className={`chat-message ${m.role === 'user' ? 'user' : 'model'}`}>
                        <div className="chat-bubble">
                            {/* Simple text formatting */}
                            {m.text.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                                    <br />
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="chat-message model">
                        <div className="chat-bubble typing">
                            <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input 
                    type="text" 
                    placeholder="Ask about this score..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading || !workerData}
                />
                <button type="submit" disabled={loading || !input.trim()}>
                    ➤
                </button>
            </form>
        </div>
    );
}

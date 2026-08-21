import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronDown, ChevronUp, Bot, MapPin } from "lucide-react";
import { API_BASE } from '../config';

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-3 py-2">
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    style={{
                        animation: `typing-bounce 0.8s ease-in-out ${i * 0.15}s infinite`
                    }}
                />
            ))}
        </div>
    );
}

function Chatbot({ chatOpen, setChatOpen }) {
    const CONCISE_INSTRUCTIONS = "You are floatCHAT. Answer very concisely (1–2 sentences). Use ARGO data when provided. Include numbers with units. If uncertain, say so briefly.";
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: 'Hi! I\'m floatCHAT — your ocean data assistant. Ask me about ARGO floats, temperature, salinity, or any oceanographic data.' }
    ]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [contextOpen, setContextOpen] = useState(false);
    const listRef = useRef(null);

    // Optional geospatial context for MCP-style grounding
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");
    const [rangeDeg, setRangeDeg] = useState("");
    const hasContext = Number.isFinite(parseFloat(lat)) && Number.isFinite(parseFloat(lon)) && Number.isFinite(parseFloat(rangeDeg));

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, chatOpen]);

    const suggestedPrompts = [
        "What is the average ocean temperature?",
        "Explain ARGO floats",
        "Show salinity trends",
    ];

    async function sendMessage(text) {
        text = (text || input).trim();
        if (!text || loading) return;
        setError(null);
        setInput("");
        const userMsg = { id: Date.now(), role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        try {
            const endpoint = hasContext ? `${API_BASE}/ai/chat_context` : `${API_BASE}/ai/chat`;
            // Prepend concise instruction message so the model keeps answers short
            const baseMsgs = [{ role: 'user', content: CONCISE_INSTRUCTIONS }, ...messages, userMsg];
            const payload = hasContext
                ? { messages: baseMsgs.map(m => ({ role: m.role, content: m.content })), lat: parseFloat(lat), lon: parseFloat(lon), rangeDeg: parseFloat(rangeDeg) }
                : { messages: baseMsgs.map(m => ({ role: m.role, content: m.content })) };
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to get response');
            }
            const raw = (data?.text || '').trim() || 'I\'m not sure how to answer that yet.';
            // Trim to first 2 sentences or 160 chars to keep answers precise
            const sentences = raw.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
            const reply = sentences.length > 0 ? sentences.slice(0, 160) : raw.slice(0, 160);
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply }]);
        } catch (e) {
            setError(e.message || 'Something went wrong');
            setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', content: 'Sorry, I could not reach the AI service.' }]);
        } finally {
            setLoading(false);
        }
    }

    function onKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <AnimatePresence>
            {chatOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-[420px] h-[520px] glass rounded-xl shadow-2xl border border-[var(--border-strong)] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                                <Bot size={16} className="text-[var(--accent)]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white leading-none">floatCHAT</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="glow-dot" style={{ width: 6, height: 6 }} />
                                    <span className="text-[10px] text-white/40">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className="btn-ghost p-1.5 rounded-lg text-white/50 hover:text-white"
                            onClick={() => setChatOpen(false)}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Collapsible Context */}
                    <div className="border-b border-[var(--border)]">
                        <button
                            onClick={() => setContextOpen(!contextOpen)}
                            className="w-full flex items-center justify-between px-4 py-2 text-xs text-white/50 hover:text-white/70 transition-colors"
                        >
                            <div className="flex items-center gap-1.5">
                                <MapPin size={12} />
                                <span>Location Context {hasContext && '• Active'}</span>
                            </div>
                            {contextOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                        <AnimatePresence>
                            {contextOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="grid grid-cols-3 gap-2 px-4 pb-2.5">
                                        <input
                                            type="number" step="0.01" placeholder="Lat"
                                            value={lat} onChange={(e) => setLat(e.target.value)}
                                            className="input-field text-xs py-1.5"
                                        />
                                        <input
                                            type="number" step="0.01" placeholder="Lon"
                                            value={lon} onChange={(e) => setLon(e.target.value)}
                                            className="input-field text-xs py-1.5"
                                        />
                                        <input
                                            type="number" step="0.1" placeholder="Range°"
                                            value={rangeDeg} onChange={(e) => setRangeDeg(e.target.value)}
                                            className="input-field text-xs py-1.5"
                                        />
                                    </div>
                                    {hasContext && (
                                        <div className="px-4 pb-2 text-[10px] text-[var(--accent)]">
                                            Context: {parseFloat(lat).toFixed(2)}°, {parseFloat(lon).toFixed(2)}° ±{parseFloat(rangeDeg)}°
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Messages */}
                    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.map((m, i) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`${
                                    m.role === 'user'
                                        ? 'bg-[var(--accent)]/15 border-[var(--accent)]/20 rounded-2xl rounded-br-md'
                                        : 'bg-white/5 border-white/8 rounded-2xl rounded-bl-md'
                                } border px-3.5 py-2 max-w-[85%] text-[13px] leading-relaxed whitespace-pre-wrap`}>
                                    {m.content}
                                </div>
                            </motion.div>
                        ))}

                        {/* Suggested prompts after welcome */}
                        {messages.length === 1 && !loading && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {suggestedPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        className="text-[11px] px-2.5 py-1.5 rounded-full border border-[var(--border)] text-white/50 hover:text-white/80 hover:border-[var(--border-strong)] hover:bg-white/3 transition-all"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="text-red-400/80 text-xs">{error}</div>
                        )}
                        {loading && <TypingDots />}
                    </div>

                    {/* Input Area */}
                    <div className="px-3 py-3 border-t border-[var(--border)]">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Ask about oceanographic data..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="input-field flex-1 py-2.5 text-sm"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={loading || !input.trim()}
                                className="btn-primary w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-40 shrink-0"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Chatbot;
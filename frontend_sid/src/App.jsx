import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/navbar';
import Chatbot from './components/Chatbot';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import OceanMap from './components/OceanMap';
import MetricMap from './components/MetricMap';
import { Bot, X } from 'lucide-react';

function OceanVizApp() {
    const [chatOpen, setChatOpen] = useState(false);
    const [activePage, setActivePage] = useState('Home');

    const isFullScreenMap = ['Argo Floats', 'Salinity', 'Temperature', 'Pressure'].includes(activePage);

    return (
        <div className="min-h-screen flex flex-col text-white w-full" style={{ background: 'transparent' }}>
            <Navbar activePage={activePage} setActivePage={setActivePage} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activePage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={isFullScreenMap ? 'flex-1 relative overflow-hidden' : 'flex-1 relative overflow-y-auto'}
                >
                    {activePage === 'Depth Profiles' && (
                        <div className="bg-white/[0.03] rounded-xl backdrop-blur-sm mx-3 md:mx-5 my-3 border border-white/[0.04]">
                            <Dashboard />
                        </div>
                    )}
                    {activePage === 'Home' && <Home setActivePage={setActivePage} setChatOpen={setChatOpen} />}
                    {activePage === 'Argo Floats' && <OceanMap setActivePage={setActivePage} />}
                    {activePage === 'Salinity' && <MetricMap metric="salinity" />}
                    {activePage === 'Temperature' && <MetricMap metric="temperature" />}
                    {activePage === 'Pressure' && <MetricMap metric="pressure" />}
                </motion.div>
            </AnimatePresence>

            {/* Chatbot FAB */}
            <motion.button
                onClick={() => setChatOpen(!chatOpen)}
                className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors"
                style={{
                    background: chatOpen ? 'rgba(255,255,255,0.08)' : 'linear-gradient(180deg, #13b8ff, #0ea5e9)',
                    border: chatOpen ? '1px solid rgba(255,255,255,0.12)' : 'none',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <AnimatePresence mode="wait">
                    {chatOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <X size={18} className="text-white/70" />
                        </motion.div>
                    ) : (
                        <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                            <Bot size={18} className="text-[#00121e]" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            <Chatbot chatOpen={chatOpen} setChatOpen={setChatOpen} />
        </div>
    );
}

export default OceanVizApp;
import React, { useState, useEffect } from 'react';
import { useStore } from '../state/store';
import { Wifi, QrCode, Scan, ShieldCheck, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export const ConnectionScreen = () => {
    const { setConnected, setCompanionUrl, companionUrl } = useStore();
    const [status, setStatus] = useState('Buscando Maestro Orquestador...');
    const [manualUrl, setManualUrl] = useState('');
    const [isManual, setIsManual] = useState(false);

    useEffect(() => {
        if (companionUrl) testConnection(companionUrl);
    }, []);

    const testConnection = async (url: string) => {
        try {
            setStatus('Sincronizando...');
            const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
            const resp = await axios.get(`${cleanUrl}/health`, { timeout: 5000 });
            if (resp.data.status === 'ok') {
                setCompanionUrl(cleanUrl);
                setConnected(true);
            }
        } catch (e) {
            setStatus('Sin señal. Escanea el dispositivo.');
        }
    };

    const handleManualConnect = () => {
        if (manualUrl) testConnection(manualUrl);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full flex flex-col items-center"
            >
                <div className="mb-12 relative">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-accent blur-3xl opacity-30 rounded-full"
                    />
                    <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden ring-1 ring-white/20">
                        <Wifi size={40} className="text-accent" />
                    </div>
                </div>

                <h1 className="text-4xl font-black tracking-tighter italic mb-4">ORCHESTRA</h1>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mb-12">{status}</p>

                <AnimatePresence mode="wait">
                    {!isManual ? (
                        <motion.div
                            key="auto"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full flex flex-col items-center"
                        >
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="w-full max-w-xs group relative p-6 rounded-[2rem] bg-gradient-to-br from-accent to-blue-600 font-black text-sm tracking-widest uppercase shadow-2xl shadow-accent/40"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <QrCode size={20} />
                                    ESCANEAR QR
                                </div>
                            </motion.button>

                            <button
                                onClick={() => setIsManual(true)}
                                className="mt-6 text-gray-500 font-bold text-[10px] uppercase tracking-widest hover:text-accent transition-colors flex items-center gap-2"
                            >
                                <Link2 size={14} />
                                Introducir URL manual
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="manual"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-xs flex flex-col gap-4"
                        >
                            <div className="glass p-1 rounded-3xl flex items-center ring-1 ring-white/10 focus-within:ring-accent transition-all">
                                <input
                                    type="text"
                                    placeholder="https://túnel-maestro.com"
                                    className="bg-transparent border-none outline-none flex-1 p-4 text-sm font-bold placeholder:text-gray-700"
                                    value={manualUrl}
                                    onChange={(e) => setManualUrl(e.target.value)}
                                />
                                <button
                                    onClick={handleManualConnect}
                                    className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center mr-1 shadow-lg"
                                >
                                    <Scan size={20} />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsManual(false)}
                                className="text-gray-600 font-bold text-[10px] uppercase tracking-widest"
                            >
                                Volver al escáner
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-16 grid grid-cols-3 gap-3 w-full max-w-sm">
                    {[
                        { icon: <Scan size={18} />, label: 'Discover' },
                        { icon: <ShieldCheck size={18} />, label: 'Secure' },
                        { icon: <Wifi size={18} />, label: 'Fast' }
                    ].map((item, i) => (
                        <div key={i} className="glass p-4 rounded-3xl flex flex-col items-center justify-center gap-2">
                            <div className="text-accent opacity-60">{item.icon}</div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

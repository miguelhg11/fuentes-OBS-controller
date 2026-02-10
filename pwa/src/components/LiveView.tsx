import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Zap, Settings, RefreshCcw, VolumeX, Volume2, Mic2, MicOff, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Props {
    onManage: () => void;
    onSettings: () => void;
}

export const LiveView = ({ onManage, onSettings }: Props) => {
    const { companionUrl, appliedSources } = useStore();
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAudio();
        const interval = setInterval(fetchAudio, 2500);
        return () => clearInterval(interval);
    }, []);

    const fetchAudio = async () => {
        try {
            const resp = await axios.get(`${companionUrl}/api/audio-sources`);
            const filtered = resp.data.sources.filter((s: any) => appliedSources.includes(s.name));
            setSources(filtered);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleMute = async (sourceName: string, currentlyMuted: boolean) => {
        try {
            await axios.post(`${companionUrl}/api/mute`, {
                sourceName,
                muted: !currentlyMuted
            });
            // Optimistic upadte
            setSources(sources.map(s => s.name === sourceName ? { ...s, muted: !currentlyMuted } : s));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] bg-accent blur-[120px] rounded-full animate-pulse" />
            </div>

            <header className="p-8 pt-12 flex justify-between items-center z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#3b82f6]" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Audio Master</span>
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter text-white/90 uppercase tracking-tight">ORCHESTRA</h2>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onManage}
                        className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-gray-400 active:scale-95 border border-white/5"
                    >
                        <Music size={20} />
                    </button>
                    <button
                        onClick={onSettings}
                        className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white ring-1 ring-accent/40 active:scale-95"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 z-10 overflow-y-auto custom-scrollbar">
                {sources.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6">
                        <Music size={40} className="text-gray-800" />
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest text-center">
                            Sin canales activos
                        </p>
                        <button onClick={onManage} className="px-8 py-3 glass rounded-full text-accent text-xs font-black uppercase tracking-[0.2em] border border-accent/20">
                            Vincular Canales
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 pb-12">
                        <AnimatePresence mode="popLayout">
                            {sources.map((source) => (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={source.name}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleMute(source.name, source.muted)}
                                    className={`p-10 rounded-[3.5rem] transition-all flex items-center justify-between relative overflow-hidden ${!source.muted
                                        ? 'bg-gradient-to-br from-accent to-blue-600 shadow-2xl shadow-accent/50'
                                        : 'glass text-gray-600 border-white/5 grayscale opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center ${!source.muted ? 'bg-white/20 text-white' : 'bg-white/5'
                                            }`}>
                                            {source.kind.includes('input')
                                                ? (source.muted ? <MicOff size={32} /> : <Mic2 size={32} />)
                                                : (source.muted ? <VolumeX size={32} /> : <Volume2 size={32} />)
                                            }
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-black tracking-tight mb-1 uppercase italic">{source.name}</h3>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${!source.muted ? 'bg-white/20 text-white' : 'bg-black/40 text-gray-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${!source.muted ? 'bg-white animate-pulse' : 'bg-gray-800'}`} />
                                                {!source.muted ? 'AL AIRE' : 'MUTED'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${!source.muted ? 'border-white/30 bg-white/10' : 'border-white/5 glass'
                                        }`}>
                                        <Zap size={24} fill={!source.muted ? 'white' : 'none'} className={!source.muted ? 'text-white' : 'text-gray-700'} />
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Floating Visualizer */}
            <footer className="p-8 pb-12 z-10">
                <div className="glass p-6 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-accent">
                            <Volume2 size={18} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                                {[...Array(40)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: [
                                                `${30 + Math.random() * 70}%`,
                                                `${10 + Math.random() * 40}%`,
                                                `${50 + Math.random() * 50}%`
                                            ]
                                        }}
                                        transition={{ duration: 0.3 + Math.random() * 0.5, repeat: Infinity }}
                                        className={`h-full w-full ${i < 30 ? 'bg-accent' : i < 35 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700">
                                <span>L - Infinity</span>
                                <span>0dB</span>
                                <span>R - Peak</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

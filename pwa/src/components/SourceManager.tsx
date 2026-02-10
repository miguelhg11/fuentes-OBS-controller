import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Mic2, Volume2, Save, ChevronLeft, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Props {
    onBack: () => void;
}

export const SourceManager = ({ onBack }: Props) => {
    const { companionUrl, appliedSources, toggleAppliedSource } = useStore();
    const [sources, setSources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const resp = await axios.get(`${companionUrl}/api/audio-sources`);
            setSources(resp.data.sources);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-black text-white flex flex-col overflow-hidden">
            <header className="p-8 pt-12 flex items-center gap-4 border-b border-white/5">
                <button onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="text-xl font-black italic tracking-tighter uppercase">Fuentes Audio</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configuración Mezclador</p>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-6 px-2">
                            <Music size={14} className="text-accent" />
                            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Selecciona para el control</h3>
                        </div>

                        {sources.map((source) => {
                            const isApplied = appliedSources.includes(source.name);
                            return (
                                <motion.div
                                    key={source.name}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleAppliedSource(source.name)}
                                    className={`glass p-6 rounded-[2.5rem] flex items-center justify-between cursor-pointer transition-all ${isApplied ? 'ring-2 ring-accent bg-accent/5' : 'opacity-40 grayscale'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center ${isApplied ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-600'
                                            }`}>
                                            {source.kind.includes('input') ? <Mic2 size={24} /> : <Volume2 size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm tracking-tight uppercase italic">{source.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                                {source.kind.replace('wasapi_', '').replace('_capture', '')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isApplied ? 'border-accent bg-accent' : 'border-white/10'
                                        }`}>
                                        {isApplied && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="p-8">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="w-full p-6 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                >
                    <Save size={18} className="text-accent" />
                    GUARDAR CONFIG
                </motion.button>
            </footer>
        </div>
    );
};

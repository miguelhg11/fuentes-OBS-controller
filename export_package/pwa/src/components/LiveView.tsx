import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Zap, Settings, RefreshCcw, LayoutPanelLeft, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Props {
    onManage: () => void;
    onFullPanel: () => void;
}

export const LiveView = ({ onManage, onFullPanel }: Props) => {
    const { companionUrl, currentScene, appliedSources } = useStore();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentScene) fetchItems();
        const interval = setInterval(fetchItems, 2000); // Polling suave para feedback real
        return () => clearInterval(interval);
    }, [currentScene]);

    const fetchItems = async () => {
        try {
            const resp = await axios.get(`${companionUrl}/api/scene-items?sceneName=${currentScene}`);
            setItems(resp.data.sceneItems.filter((it: any) => appliedSources.includes(it.sourceName)));
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleItem = async (itemId: number, enabled: boolean) => {
        try {
            await axios.post(`${companionUrl}/api/item-toggle`, {
                sceneName: currentScene,
                itemId,
                enabled: !enabled
            });
            // Update local state immediately
            setItems(items.map(it => it.sceneItemId === itemId ? { ...it, sceneItemEnabled: !enabled } : it));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black text-white relative overflow-hidden">
            {/* Background Neon Flow */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 blur-[150px] rounded-full" />
            </div>

            <header className="p-6 pt-12 flex justify-between items-center z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Escena Actual</span>
                    <h2 className="text-2xl font-black italic tracking-tighter text-white/90 uppercase">{currentScene}</h2>
                </div>
                <div className="flex gap-3">
                    <button onClick={onFullPanel} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-gray-400 active:scale-95">
                        <LayoutPanelLeft size={20} />
                    </button>
                    <button onClick={onManage} className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white ring-1 ring-accent/40 active:scale-95">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 z-10 overflow-y-auto custom-scrollbar">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center text-gray-700">
                            <Zap size={40} />
                        </div>
                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest text-center">
                            No hay fuentes aplicadas<br />para esta escena
                        </p>
                        <button onClick={onManage} className="px-6 py-3 glass rounded-full text-accent text-xs font-black uppercase tracking-widest">
                            Seleccionar Fuentes
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={item.sceneItemId}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleItem(item.sceneItemId, item.sceneItemEnabled)}
                                    className={`p-8 rounded-[3rem] transition-all flex flex-col items-center gap-4 relative overflow-hidden ${item.sceneItemEnabled
                                            ? 'bg-gradient-to-br from-accent to-blue-600 shadow-2xl shadow-accent/50'
                                            : 'glass text-gray-400 border-white/5'
                                        }`}
                                >
                                    {/* Inner Glow */}
                                    {item.sceneItemEnabled && (
                                        <div className="absolute inset-0 bg-white/10 blur-2xl animate-pulse" />
                                    )}

                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-2 ${item.sceneItemEnabled ? 'bg-white/20 text-white' : 'bg-white/5'
                                        }`}>
                                        {item.sceneItemEnabled ? <Zap size={40} className="fill-white" /> : <Zap size={40} />}
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-black tracking-tight mb-1 uppercase italic">{item.sourceName}</h3>
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase ${item.sceneItemEnabled ? 'bg-white/20 text-white' : 'bg-black/40 text-gray-600'
                                            }`}>
                                            <div className={`w-2 h-2 rounded-full ${item.sceneItemEnabled ? 'bg-white animate-pulse' : 'bg-gray-800'}`} />
                                            {item.sceneItemEnabled ? 'CONECTADO' : 'DESCONECTADO'}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <footer className="p-8 pb-12 z-10">
                <div className="glass p-5 rounded-[2.5rem] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent">
                        <Volume2 />
                    </div>
                    <div className="flex-1">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                            {[...Array(40)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3], height: ['60%', '100%', '60%'] }}
                                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                                    className={`h-full w-full ${i < 30 ? 'bg-accent' : i < 35 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

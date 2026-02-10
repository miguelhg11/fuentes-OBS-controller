import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Check, ArrowLeft, Layers, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Props {
    onBack: () => void;
}

export const SourceManager = ({ onBack }: Props) => {
    const { companionUrl, currentScene, appliedSources, toggleAppliedSource } = useStore();
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        if (currentScene) fetchItems();
    }, [currentScene]);

    const fetchItems = async () => {
        try {
            const resp = await axios.get(`${companionUrl}/api/scene-items?sceneName=${currentScene}`);
            setItems(resp.data.sceneItems);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black text-white">
            <header className="p-6 pt-12 glass border-b-0 rounded-b-[2rem] flex items-center gap-4 z-10">
                <button onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 active:scale-95">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="font-black text-xl tracking-tighter italic">GESTIÓN</h2>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Añade fuentes al panel</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-5 pb-32">
                <div className="mb-6 flex items-center gap-2">
                    <Layers size={14} className="text-accent" />
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Fuentes en {currentScene}</span>
                </div>

                <div className="space-y-3">
                    {items.map((item) => {
                        const isApplied = appliedSources.includes(item.sourceName);
                        return (
                            <motion.div
                                key={item.sceneItemId}
                                onClick={() => toggleAppliedSource(item.sourceName)}
                                className={`glass p-5 rounded-3xl flex items-center justify-between cursor-pointer transition-all ${isApplied ? 'ring-2 ring-accent bg-accent/5' : 'opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isApplied ? 'bg-accent text-white' : 'bg-white/5 text-gray-600'}`}>
                                        <MousePointer2 size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">{item.sourceName}</p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase">{item.sourceType.replace('OBS_SOURCE_TYPE_', '')}</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isApplied ? 'bg-accent border-accent text-white' : 'border-white/10'}`}>
                                    {isApplied && <Check size={14} strokeWidth={4} />}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-[2.5rem] p-4 text-center shadow-2xl shadow-black">
                <button
                    onClick={onBack}
                    className="w-full h-14 rounded-3xl bg-accent text-white font-black tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-transform"
                >
                    APLICAR SELECCIÓN
                </button>
            </footer>
        </div>
    );
};

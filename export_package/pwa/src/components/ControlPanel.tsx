import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Grid, Volume2, Settings, Zap, Eye, EyeOff, LayoutPanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { SourceManager } from './SourceManager';
import { LiveView } from './LiveView';

export const ControlPanel = () => {
    const { companionUrl, scenes, setScenes, currentScene, setCurrentScene, appliedSources } = useStore();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isManaging, setIsManaging] = useState(false);
    const [isLive, setIsLive] = useState(appliedSources.length > 0);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (currentScene) fetchSceneItems(currentScene);
    }, [currentScene]);

    // Refrescar al volver de gestión
    useEffect(() => {
        if (!isManaging && currentScene) fetchSceneItems(currentScene);
    }, [isManaging]);

    // Si no hay fuentes aplicadas, no podemos estar en modo Live
    useEffect(() => {
        if (appliedSources.length === 0) setIsLive(false);
    }, [appliedSources]);

    const fetchData = async () => {
        try {
            const resp = await axios.get(`${companionUrl}/api/scenes`);
            setScenes(resp.data.scenes);
            setCurrentScene(resp.data.currentProgramSceneName);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSceneItems = async (sceneName: string) => {
        try {
            const resp = await axios.get(`${companionUrl}/api/scene-items?sceneName=${sceneName}`);
            setItems(resp.data.sceneItems);
        } catch (e) {
            console.error(e);
        }
    };

    const changeScene = async (name: string) => {
        try {
            await axios.post(`${companionUrl}/api/scene`, { sceneName: name });
            setCurrentScene(name);
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
            // Actualización optimista
            setItems(items.map(it => it.sceneItemId === itemId ? { ...it, sceneItemEnabled: !enabled } : it));
        } catch (e) {
            console.error(e);
        }
    };

    if (isManaging) return <SourceManager onBack={() => { setIsManaging(false); if (appliedSources.length > 0) setIsLive(true); }} />;
    if (isLive) return <LiveView onManage={() => setIsManaging(true)} onFullPanel={() => setIsLive(false)} />;

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-black">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
            />
        </div>
    );

    const activeAppliedItems = items.filter(it => appliedSources.includes(it.sourceName));

    return (
        <div className="h-full flex flex-col bg-black text-white overflow-hidden">
            {/* Dynamic Header */}
            <header className="p-6 pt-12 glass border-b-0 rounded-b-[2rem] flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/20">
                        <Zap size={22} className="text-white fill-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-xl tracking-tighter italic">ORCHESTRA</h2>
                        <div className="flex items-center gap-1.5 ring-1 ring-white/10 px-2 py-0.5 rounded-full w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {appliedSources.length > 0 && (
                        <button
                            onClick={() => setIsLive(true)}
                            className="w-10 h-10 rounded-full glass flex items-center justify-center text-accent ring-1 ring-accent/30 active:scale-95"
                        >
                            <Zap size={20} className="fill-accent" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsManaging(true)}
                        className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 active:scale-95"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-5 pb-32 custom-scrollbar">

                {/* Scenes Section */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Escenas</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {scenes.map((scene) => (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                key={scene.sceneName}
                                onClick={() => changeScene(scene.sceneName)}
                                className={`relative group p-6 rounded-[2.5rem] font-black text-sm tracking-tight transition-all h-32 overflow-hidden ${currentScene === scene.sceneName
                                    ? 'bg-gradient-to-br from-accent to-blue-700 text-white shadow-2xl shadow-accent/40 ring-2 ring-white/20'
                                    : 'glass text-gray-400 hover:text-white'
                                    }`}
                            >
                                <span className="z-10 relative">{scene.sceneName}</span>
                                {currentScene === scene.sceneName && (
                                    <motion.div
                                        layoutId="outline"
                                        className="absolute inset-0 bg-white/10 blur-xl scale-125"
                                    />
                                )}
                                <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12">
                                    <LayoutPanelLeft size={60} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Real Applied Sources Section */}
                <section className="mb-10">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Control Rápido</h3>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {activeAppliedItems.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center"
                                >
                                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Sin fuentes seleccionadas</p>
                                    <button
                                        onClick={() => setIsManaging(true)}
                                        className="mt-4 text-accent text-xs font-bold underline"
                                    >
                                        Abrir Gestión
                                    </button>
                                </motion.div>
                            ) : (
                                activeAppliedItems.map((item) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={item.sceneItemId}
                                        className="glass p-5 rounded-[2.5rem] flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-3xl flex items-center justify-center shadow-inner ${item.sceneItemEnabled ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'}`}>
                                                {item.sceneItemEnabled ? <Eye size={22} strokeWidth={2.5} /> : <EyeOff size={22} strokeWidth={2.5} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm tracking-tight">{item.sourceName}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.sceneItemEnabled ? 'bg-accent shadow-[0_0_5px_#3b82f6]' : 'bg-gray-700'}`} />
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.sceneItemEnabled ? 'On Air' : 'Hidden'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleItem(item.sceneItemId, item.sceneItemEnabled)}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${item.sceneItemEnabled ? 'bg-accent/10 border border-accent/30 text-accent' : 'glass text-gray-700'
                                                }`}
                                        >
                                            <Zap fill={item.sceneItemEnabled ? 'currentColor' : 'none'} size={20} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Audio Hub (Placeholder for now) */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Audio Hub</h3>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <div className="glass p-5 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent">
                                <Volume2 />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-2 px-1">
                                    <span className="font-bold text-sm tracking-tight text-white/90">Monitor Principal</span>
                                    <span className="text-[10px] font-black text-accent">-12dB</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className={`h-full w-full ${i < 14 ? 'bg-accent' : i < 18 ? 'bg-yellow-400' : 'bg-red-500'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Floating Bottom Navigation */}
            <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass rounded-[2.5rem] p-3 flex justify-between items-center shadow-2xl shadow-black">
                <button className="flex-1 h-14 rounded-3xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                    <Grid size={24} />
                </button>
                <button className="flex-1 h-14 rounded-3xl text-gray-500 flex items-center justify-center">
                    <Volume2 size={24} />
                </button>
                <button
                    onClick={() => setIsManaging(true)}
                    className="flex-1 h-14 rounded-3xl text-gray-500 flex items-center justify-center"
                >
                    <Settings size={24} />
                </button>
            </footer>
        </div>
    );
};

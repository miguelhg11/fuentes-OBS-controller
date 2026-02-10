import React, { useState } from 'react';
import { useStore } from '../state/store';
import { Settings, Shield, Link2, Save, ChevronLeft, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Props {
    onBack: () => void;
}

export const SettingsView = ({ onBack }: Props) => {
    const { companionUrl, setCompanionUrl } = useStore();
    const [port, setPort] = useState('4455');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<null | 'success' | 'error'>(null);

    const saveConfig = async () => {
        setLoading(true);
        setStatus(null);
        try {
            await axios.post(`${companionUrl}/api/obs-config`, { port, password });
            setStatus('success');
            setTimeout(onBack, 1500);
        } catch (e) {
            console.error(e);
            setStatus('error');
        } finally {
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
                    <h2 className="text-xl font-black italic tracking-tighter">CONFIGURACIÓN</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Maestro Orquestador Audio</p>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto space-y-8">
                {/* Companion Setting */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Wifi size={14} className="text-accent" />
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Conexión Companion</h3>
                    </div>
                    <div className="glass p-5 rounded-[2.5rem]">
                        <label className="text-[10px] text-gray-400 font-black uppercase mb-2 block">URL del Companion</label>
                        <input
                            type="text"
                            value={companionUrl || ''}
                            onChange={e => setCompanionUrl(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold outline-none focus:border-accent"
                        />
                    </div>
                </section>

                {/* OBS WebSocket Setting */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Shield size={14} className="text-accent" />
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">OBS WebSocket</h3>
                    </div>
                    <div className="glass p-8 rounded-[2.5rem] space-y-6">
                        <div>
                            <label className="text-[10px] text-gray-400 font-black uppercase mb-2 block tracking-widest">Puerto WebSocket</label>
                            <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-4 px-5">
                                <Link2 size={18} className="text-gray-600" />
                                <input
                                    type="number"
                                    value={port}
                                    onChange={e => setPort(e.target.value)}
                                    placeholder="4455"
                                    className="bg-transparent border-none outline-none flex-1 text-sm font-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-400 font-black uppercase mb-2 block tracking-widest">Contraseña</label>
                            <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-4 px-5">
                                <Shield size={18} className="text-gray-600" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Opcional"
                                    className="bg-transparent border-none outline-none flex-1 text-sm font-black"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={saveConfig}
                            disabled={loading}
                            className={`w-full p-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${status === 'success' ? 'bg-green-500 text-white' :
                                    status === 'error' ? 'bg-red-500 text-white' :
                                        'bg-accent text-white shadow-xl shadow-accent/20'
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    {status === 'success' ? 'GUARDADO' : status === 'error' ? 'ERROR' : 'SINCRONIZAR OBS'}
                                </>
                            )}
                        </motion.button>
                    </div>
                </section>

                <p className="text-center text-[10px] text-gray-600 font-bold px-4 leading-relaxed">
                    * Al sincronizar, el Companion intentará reconectarse a tu instancia de OBS con los nuevos datos.
                </p>
            </main>
        </div>
    );
};

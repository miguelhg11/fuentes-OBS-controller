import React, { useEffect, useState } from 'react';
import { useStore } from '../state/store';
import { Zap, Settings, Shield, SlidersHorizontal, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { SourceManager } from './SourceManager';
import { LiveView } from './LiveView';
import { SettingsView } from './SettingsView';

export const ControlPanel = () => {
    const { companionUrl, appliedSources, setConnected, isConnected } = useStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'live' | 'manage' | 'settings'>(
        appliedSources.length > 0 ? 'live' : 'manage'
    );

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        try {
            const resp = await axios.get(`${companionUrl}/health`);
            setConnected(resp.data.obsConnected);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-black gap-6">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full shadow-[0_0_30px_#3b82f644]"
            />
            <p className="text-accent font-black text-xs uppercase tracking-[0.5em] animate-pulse">Sincronizando Maestro</p>
        </div>
    );

    if (activeTab === 'manage') return <SourceManager onBack={() => setActiveTab('live')} />;
    if (activeTab === 'settings') return <SettingsView onBack={() => setActiveTab('live')} />;
    if (activeTab === 'live') return <LiveView onManage={() => setActiveTab('manage')} onSettings={() => setActiveTab('settings')} />;

    return null;
};

import { create } from 'zustand';

interface OBSState {
    isConnected: boolean;
    audioSources: any[];
    companionUrl: string | null;
    appliedSources: string[]; // Nombres de fuentes seleccionadas para control
    setConnected: (status: boolean) => void;
    setAudioSources: (sources: any[]) => void;
    setCompanionUrl: (url: string) => void;
    toggleAppliedSource: (sourceName: string) => void;
}

export const useStore = create<OBSState>((set) => ({
    isConnected: false,
    audioSources: [],
    companionUrl: localStorage.getItem('companionUrl') || `http://${window.location.hostname}:17800`,
    appliedSources: JSON.parse(localStorage.getItem('appliedSources') || '[]'),
    setConnected: (status) => set({ isConnected: status }),
    setAudioSources: (sources) => set({ audioSources: sources }),
    setCompanionUrl: (url) => {
        localStorage.setItem('companionUrl', url);
        set({ companionUrl: url });
    },
    toggleAppliedSource: (sourceName) => set((state) => {
        const newSources = state.appliedSources.includes(sourceName)
            ? state.appliedSources.filter(s => s !== sourceName)
            : [...state.appliedSources, sourceName];
        localStorage.setItem('appliedSources', JSON.stringify(newSources));
        return { appliedSources: newSources };
    }),
}));

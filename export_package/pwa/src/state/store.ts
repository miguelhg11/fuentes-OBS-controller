import { create } from 'zustand';

interface OBSState {
    isConnected: boolean;
    scenes: any[];
    currentScene: string | null;
    companionUrl: string | null;
    appliedSources: string[]; // IDs o nombres de fuentes seleccionadas para control
    setConnected: (status: boolean) => void;
    setScenes: (scenes: any[]) => void;
    setCurrentScene: (scene: string) => void;
    setCompanionUrl: (url: string) => void;
    toggleAppliedSource: (sourceName: string) => void;
}

export const useStore = create<OBSState>((set) => ({
    isConnected: false,
    scenes: [],
    currentScene: null,
    companionUrl: localStorage.getItem('companionUrl') || `http://${window.location.hostname}:17800`,
    appliedSources: JSON.parse(localStorage.getItem('appliedSources') || '[]'),
    setConnected: (status) => set({ isConnected: status }),
    setScenes: (scenes) => set({ scenes }),
    setCurrentScene: (scene) => set({ currentScene: scene }),
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

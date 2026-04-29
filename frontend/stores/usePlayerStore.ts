import { create } from 'zustand';

interface PlayerStore {
    player: any;
    setPlayer: (player: any) => void;
    clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
    player: null,
    setPlayer: (player) => set({ player }),
    clearPlayer: () => set({ player: null })
}))

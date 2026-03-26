import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface DanmakuItem {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'danmaku' | 'gift' | 'sc' | 'superchat';
  giftName?: string;
  giftCount?: number;
  scAmount?: number;
  userAvatar?: string;
  isVerified?: boolean;
  userTitle?: string;
  isPinned?: boolean;
  isHighlighted?: boolean;
}

export interface RoomInfo {
  roomId: string;
  roomName: string;
  anchorName: string;
  anchorAvatar?: string;
  onlineCount?: number;
  fansCount?: number;
}

interface AppState {
  currentRoom: RoomInfo | null;
  danmakuList: DanmakuItem[];
  giftList: DanmakuItem[];
  scList: DanmakuItem[];
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  settings: {
    showDanmaku: boolean;
    showGift: boolean;
    showSC: boolean;
    danmakuSpeed: number;
    danmakuOpacity: number;
    fontSize: 'small' | 'medium' | 'large';
    theme: 'dark' | 'light' | 'auto';
    soundEnabled: boolean;
    ttsEnabled: boolean;
  };
  addDanmaku: (item: DanmakuItem) => void;
  addGift: (item: DanmakuItem) => void;
  addSC: (item: DanmakuItem) => void;
  setCurrentRoom: (room: RoomInfo | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  clearDanmaku: () => void;
  clearGifts: () => void;
  clearSC: () => void;
  clearAll: () => void;
  reconnect: () => void;
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    currentRoom: null,
    danmakuList: [],
    giftList: [],
    scList: [],
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    settings: {
      showDanmaku: true,
      showGift: true,
      showSC: true,
      danmakuSpeed: 5,
      danmakuOpacity: 1,
      fontSize: 'medium',
      theme: 'dark',
      soundEnabled: false,
      ttsEnabled: false,
    },
    addDanmaku: (item) =>
      set((state) => {
        state.danmakuList.push(item);
        if (state.danmakuList.length > 500) {
          state.danmakuList = state.danmakuList.slice(-500);
        }
      }),
    addGift: (item) =>
      set((state) => {
        state.giftList.unshift(item);
        if (state.giftList.length > 100) {
          state.giftList = state.giftList.slice(0, 100);
        }
      }),
    addSC: (item) =>
      set((state) => {
        state.scList.unshift(item);
        if (state.scList.length > 50) {
          state.scList = state.scList.slice(0, 50);
        }
      }),
    setCurrentRoom: (room) =>
      set((state) => {
        state.currentRoom = room;
      }),
    setConnected: (connected) =>
      set((state) => {
        state.isConnected = connected;
      }),
    setConnecting: (connecting) =>
      set((state) => {
        state.isConnecting = connecting;
      }),
    setConnectionError: (error) =>
      set((state) => {
        state.connectionError = error;
      }),
    updateSettings: (newSettings) =>
      set((state) => {
        Object.assign(state.settings, newSettings);
      }),
    clearDanmaku: () =>
      set((state) => {
        state.danmakuList = [];
      }),
    clearGifts: () =>
      set((state) => {
        state.giftList = [];
      }),
    clearSC: () =>
      set((state) => {
        state.scList = [];
      }),
    clearAll: () =>
      set((state) => {
        state.danmakuList = [];
        state.giftList = [];
        state.scList = [];
      }),
    reconnect: () =>
      set((state) => {
        state.isConnected = false;
        state.isConnecting = false;
      }),
  }))
);

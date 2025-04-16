"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  restoreWelcomeMessage: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const WELCOME_MESSAGE = "Hello! I'm your sustainability assistant. I can help with questions about carbon footprint reduction, eco-friendly practices, renewable energy, and other sustainability topics. How can I assist you today?";

export const useChatState = create<ChatState>()(
  persist(
    (set) => ({
      messages: [
        {
          role: "assistant",
          content: WELCOME_MESSAGE,
        },
      ],
      isOpen: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      setMessages: (messages) => set({ messages }),
      clearMessages: () =>
        set({
          messages: [],
        }),
      restoreWelcomeMessage: () =>
        set({
          messages: [
            {
              role: "assistant",
              content: WELCOME_MESSAGE,
            },
          ],
        }),
      openChat: () => set({ isOpen: true }),
      closeChat: () => set({ isOpen: false }),
      toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'chat-storage',
    }
  )
); 
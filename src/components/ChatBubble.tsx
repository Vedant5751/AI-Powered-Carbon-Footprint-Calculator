"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Minimize,
  Leaf,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatState } from "@/lib/hooks/useChatState";

export default function ChatBubble() {
  const {
    messages,
    isOpen,
    addMessage,
    toggleChat,
    closeChat,
    clearMessages,
    restoreWelcomeMessage,
  } = useChatState();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // If chat is empty, restore welcome message first before adding user message
    if (messages.length === 0) {
      restoreWelcomeMessage();
    }

    const userMessage = { role: "user" as const, content: inputValue.trim() };
    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      addMessage({ role: "assistant", content: data.response });
    } catch (error) {
      console.error("Failed to send message:", error);
      addMessage({
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setShowClearDialog(true);
  };

  const confirmClearChat = () => {
    clearMessages();
    setShowClearDialog(false);
  };

  const handleNewChat = () => {
    restoreWelcomeMessage();
  };

  const isEmptyChat = messages.length === 0;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        {isOpen ? (
          <div className="flex flex-col w-80 md:w-96 h-[500px] bg-background border rounded-lg shadow-lg overflow-hidden mb-2 transition-all duration-300 ease-in-out">
            <div className="bg-primary p-3 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                <h2 className="text-lg font-semibold">
                  Sustainability Assistant
                </h2>
              </div>
              <div className="flex gap-1">
                {!isEmptyChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:bg-primary-foreground/20"
                    onClick={handleClearChat}
                    title="Clear chat history"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-primary-foreground/20"
                  onClick={toggleChat}
                  title="Minimize"
                >
                  <Minimize className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-primary-foreground/20"
                  onClick={closeChat}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-muted/40 p-2 text-xs text-center border-b">
              <p>
                Ask me questions about sustainability and carbon footprint
                reduction
              </p>
            </div>

            <ScrollArea className="flex-1 p-3 bg-muted/20">
              <div className="space-y-4">
                {isEmptyChat ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                    <Leaf className="h-12 w-12 mb-4 text-green-600 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">Chat cleared</h3>
                    <p className="text-sm mb-6">
                      Start a new conversation about sustainability.
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleNewChat}
                      className="gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>New conversation</span>
                    </Button>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-secondary text-secondary-foreground">
                      <p className="flex items-center text-sm">
                        <span className="mr-2">Thinking</span>
                        <span className="animate-pulse">...</span>
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
              <Input
                placeholder="Ask about sustainability..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-sm"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : null}

        <Button
          onClick={toggleChat}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
          aria-label="Open sustainability assistant"
        >
          <Leaf className="h-6 w-6" />
        </Button>
      </div>

      {/* Clear Chat Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear chat history</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear your conversation history? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClearChat}>
              Clear history
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

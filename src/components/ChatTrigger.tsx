"use client";

import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";
import { useChatState } from "@/lib/hooks/useChatState";

interface ChatTriggerProps {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export default function ChatTrigger({
  variant = "default",
  size = "default",
  className = "",
  children,
}: ChatTriggerProps) {
  const { openChat } = useChatState();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={openChat}
    >
      {children || (
        <>
          <Leaf className="mr-2 h-4 w-4" />
          <span>Ask Sustainability Assistant</span>
        </>
      )}
    </Button>
  );
}

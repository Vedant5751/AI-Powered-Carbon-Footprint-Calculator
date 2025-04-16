"use client";

import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebarChange" as any, handleSidebarChange);

    return () => {
      window.removeEventListener("sidebarChange" as any, handleSidebarChange);
    };
  }, []);

  return (
    <div
      className={cn(
        "space-y-6 py-8 px-6 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

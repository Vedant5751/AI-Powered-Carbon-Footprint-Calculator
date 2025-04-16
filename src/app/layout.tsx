"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Sidebar } from "@/components/sidebar";
import ChatBubble from "@/components/ChatBubble";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isRootPage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {(isRootPage || isLoginPage) && <Header />}

            <div className="flex flex-1">
              {!isRootPage && !isLoginPage && (
                <Sidebar onCollapse={setSidebarCollapsed} />
              )}

              <main
                className={cn(
                  "flex-1 transition-all duration-300",
                  !isRootPage && !isLoginPage
                    ? isMobile
                      ? "ml-16 px-3 sm:px-4"
                      : sidebarCollapsed
                      ? "ml-16 px-4 md:px-6"
                      : "ml-64 px-4 md:px-6"
                    : "px-0"
                )}
              >
                {children}
              </main>
            </div>

            {(isRootPage || isLoginPage) && <Footer />}

            {!isRootPage && !isLoginPage && <ChatBubble />}
          </div>
        </Providers>
      </body>
    </html>
  );
}

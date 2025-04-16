"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calculator,
  Home,
  User,
  Leaf,
  History,
  Lightbulb,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ModeToggle } from "./mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Calculator",
    href: "/calculator",
    icon: Calculator,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Target,
  },
  {
    title: "Trends",
    href: "/trends",
    icon: BarChart3,
  },
  {
    title: "History",
    href: "/history",
    icon: History,
  },
  {
    title: "Recommendations",
    href: "/recommendations",
    icon: Lightbulb,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      }
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [collapsed]);

  useEffect(() => {
    // Emit a custom event when sidebar state changes
    const event = new CustomEvent("sidebarChange", {
      detail: { collapsed },
    });
    window.dispatchEvent(event);

    // Call the callback prop if provided
    if (onCollapse) {
      onCollapse(collapsed);
    }
  }, [collapsed, onCollapse]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // For mobile, render a slide-out sheet
  if (isMobile) {
    return (
      <>
        {/* Fixed mobile header with menu button */}
        <div className="md:hidden fixed top-0 left-0 z-40 w-16 h-screen flex flex-col items-center border-r bg-background pt-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mb-6">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <div className="flex h-14 items-center border-b px-4 justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Leaf className="h-6 w-6 text-green-600" />
                  <span className="font-bold">EcoTrack</span>
                </Link>
              </div>

              <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t p-2">
                <div className="mb-2">
                  <ModeToggle />
                </div>
              </div>

              <div className="mt-auto border-t p-2">
                {isLoading ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    disabled
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Loading...</span>
                  </Button>
                ) : session ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Sign Out</span>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    disabled
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Sign Out</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Sidebar icons for quick navigation */}
          <nav className="flex flex-col items-center gap-4 mt-4">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                    isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  title={item.title}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  // For desktop, render the regular sidebar
  return (
    <div
      className={cn(
        "fixed h-screen z-30 flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4 justify-between">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold">EcoTrack</span>
          </Link>
        )}
        {collapsed && <Leaf className="h-6 w-6 text-green-600 mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          className={cn("", collapsed && "mx-auto")}
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && item.title}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t p-2", collapsed ? "mt-auto" : "")}>
        <div className={cn("mb-2", collapsed ? "flex justify-center" : "")}>
          <ModeToggle />
        </div>
      </div>

      <div className="mt-auto border-t p-2">
        {isLoading ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              collapsed ? "justify-center" : "justify-start"
            )}
            disabled
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Loading...</span>}
          </Button>
        ) : session ? (
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              collapsed ? "justify-center" : "justify-start"
            )}
            onClick={handleSignOut}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              collapsed ? "justify-center" : "justify-start"
            )}
            disabled
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        )}
      </div>
    </div>
  );
}

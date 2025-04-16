"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Leaf, User, Menu, X } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 justify-between items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            <span className="font-bold text-lg sm:text-xl">EcoTrack</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/trends">Trends</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/calculator">Calculator</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSignIn}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 border-t bg-background">
          <div className="flex flex-col space-y-3">
            <ModeToggle />
            {isLoading ? (
              <Button variant="ghost" disabled className="justify-start">
                Loading...
              </Button>
            ) : session ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {session.user?.name || "User"}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="text-sm py-2 hover:text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/trends"
                  className="text-sm py-2 hover:text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trends
                </Link>
                <Link
                  href="/profile"
                  className="text-sm py-2 hover:text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/calculator"
                  className="text-sm py-2 hover:text-green-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calculator
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="justify-start px-0"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleSignIn}
                  className="justify-start"
                >
                  Sign In
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSignIn}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

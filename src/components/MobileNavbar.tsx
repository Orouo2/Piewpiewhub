"use client";

import {
  BellIcon,
  Bitcoin,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";
import UserSearch from "./UserSearch";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const profileUrl = user
  ? `/profile/${user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]}`
  : "/profile";

  return (
    <div className="flex md:hidden items-center space-x-2">
      <UserSearch />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mr-2"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild onClick={() => setShowMobileMenu(false)}>
              <Link href="/">
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
            </Button>

            <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild onClick={() => setShowMobileMenu(false)}>
              <Link href="/Crypto">
                <Bitcoin className="w-4 h-4" />
                Crypto
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild onClick={() => setShowMobileMenu(false)}>
                  <Link href="/notifications">
                    <BellIcon className="w-4 h-4" />
                    Notifications
                  </Link>
                </Button>
                <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild onClick={() => setShowMobileMenu(false)}>
                  <Link href={profileUrl}>
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                </Button>
                <SignOutButton>
                  <Button variant="ghost" className="flex items-center gap-3 justify-start w-full " onClick={() => setShowMobileMenu(false)}>
                    <LogOutIcon className="w-4 h-4" />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="w-full" onClick={() => setShowMobileMenu(false)}>
                  Sign In
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
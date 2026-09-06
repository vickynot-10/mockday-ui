"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BellRing, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileDropdown, { getInitials } from "@/components/shadcn-space/blocks/topbar-04/header/dropdown-profile";
import Sidebar from "@/components/shadcn-space/blocks/topbar-04/header/sidebar";
import {
  NavDropdown,
  NavButton,
} from "@/components/shadcn-space/blocks/topbar-04/header/desktop-nav";
import NavData from "@/components/shadcn-space/blocks/topbar-04/data";
import { NavGroup } from "@/components/shadcn-space/blocks/topbar-04/types";
import NotificationDropdown from "@/components/shadcn-space/blocks/topbar-04/header/notification-dropdown";
import { useMe } from "@/hooks/useMe";

const BREAKPOINT = 991;

export default function Header() {
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= BREAKPOINT) {
        setSheetOpen(false);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

    const { data } = useMe();

     const name = data?.name;
  const initials = getInitials(name);

  return (
    <header className="sticky top-0 z-50 border-b p-4 bg-[#272a32]">
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              id="mobile-sidebar-trigger-04"
              className="lg:hidden"
              render={
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Menu size={20} />
                </Button>
              }
            />

            <SheetContent side="left" className="p-0 w-75">
              <SheetTitle className="sr-only">customizer</SheetTitle>

              <ScrollArea className="h-full">
                <Link
                  href="/"
                  className="p-4 sticky top-0 bg-background z-10 block"
                >
                  <img
                    src="https://images.shadcnspace.com/assets/logo/shadcnspace.svg"
                    alt="logo"
                    className="dark:hidden w-[160px] h-10"
                  />
                  <img
                    src="https://images.shadcnspace.com/assets/logo/shadcnspace-white.svg"
                    alt="logo"
                    className="hidden dark:block w-[160px] h-10"
                  />
                </Link>

                <Sidebar onLinkClick={() => setSheetOpen(false)} />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Link href="/">
            <img
              src="https://images.shadcnspace.com/assets/logo/shadcnspace.svg"
              alt="logo"
              className="dark:hidden w-[160px] h-10"
            />
            <img
              src="https://images.shadcnspace.com/assets/logo/shadcnspace-white.svg"
              alt="logo"
              className="hidden dark:block w-[160px] h-10"
            />
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-between">
          <NavigationMenu>
            <NavigationMenuList className="space-x-0">
              {(NavData as NavGroup[]).map((item) => {
                if (item.type === "dropdown" && item.items) {
                  return (
                    <NavDropdown
                      key={item.label}
                      label={item.label}
                      icon={item.icon}
                      items={item.items}
                    />
                  );
                }
                return (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      render={
                        <NavButton
                          label={item.label}
                          icon={item.icon}
                          href={item.href!}
                        />
                      }
                    />
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown
            defaultOpen={false}
            align="center"
            trigger={
              <div className="rounded-full p-2 hover:bg-accent relative before:absolute before:bottom-0 before:left-1/2 before:z-10 before:w-2 before:h-2 before:rounded-full before:bg-red-500 before:top-1">
                <BellRing className="size-4" />
              </div>
            }
          />

          <ProfileDropdown
            trigger={
              <Button
                id="profile-dropdown-trigger-04"
                variant="ghost"
                size="icon"
                className="size-7 rounded-full cursor-pointer"
                suppressHydrationWarning
              >
                <Avatar className="size-7 rounded-full">
                
                  <AvatarFallback> {initials } </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}

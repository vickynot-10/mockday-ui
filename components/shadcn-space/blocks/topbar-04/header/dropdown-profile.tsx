"use client";

import type { ReactElement } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useSignout } from "@/hooks/queries/useAuth";

type Props = {
  trigger: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

export function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}
const itemClass = "px-4 py-2.5 text-base cursor-pointer gap-3";

const ProfileDropdown = ({ trigger, defaultOpen, align = "end" }: Props) => {
  const { data, isLoading } = useMe();
  const { mutate: signout, isPending } = useSignout();
  function handleSignout() {
    signout();
  }

  const name = data?.name;
  const email = data?.email;
  const initials = getInitials(name);

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger} />

      <DropdownMenuContent className="w-80" align={align}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
            <div className="relative">
              <Avatar className="size-10">
               
                <AvatarFallback>{initials} </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-col">
              <span className="text-foreground text-lg font-semibold">
                {isLoading ? "Loading..." : name}
              </span>
              <span className="text-muted-foreground text-sm">{ isLoading ? "Loading..." :  email}</span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem variant="destructive" className={itemClass}
          onClick={handleSignout}
          >
            <LogOut size={20} />
            <span> {isPending ? "Signing out" : "Signout"} </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;

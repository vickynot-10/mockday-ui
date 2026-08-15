"use client";
import { useMe } from "@/hooks/useMe";
import { useSignout } from "@/hooks/queries/useAuth";
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
import { LucideIcon, LogOut } from "lucide-react";

type Props = {
  trigger: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
  name?: string;
  email?: string;
  onSignout?: () => void;
  signingOut?: boolean;
};

const itemClass =
  "p-2 text-sm font-medium text-popover-foreground cursor-pointer gap-2";

function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

const Dropdown = ({
  trigger,
  defaultOpen,
  align = "end",
  name,
  email,
  onSignout,
  signingOut,
}: Props) => {
  return (
    <div className="flex items-start justify-center p-4 sm:p-8">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger className="cursor-pointer">
          {trigger}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={align}
          className="w-3xs rounded-2xl data-open:slide-in-from-bottom-20! data-closed:slide-out-to-bottom-20 data-open:fade-in-0 data-closed:fade-out-0 data-closed:zoom-out-100 duration-400"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <Avatar className="size-10">
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <span className="ring-card absolute right-0 bottom-0 size-2 rounded-full bg-green-600 ring-2" />
              </div>

              <div className="flex flex-col">
                <span className="text-popover-foreground text-sm font-medium">
                  {name}
                </span>
                <span className="text-muted-foreground text-sm">{email}</span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              className={itemClass}
              disabled={signingOut}
              onClick={onSignout}
            >
              <LogOut size={20} />
              <span>{signingOut ? "Signing out..." : "Signout"}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ProfileDropdown = () => {
  const { data, isLoading } = useMe();
  const { mutate: signout, isPending } = useSignout();
  function handleSignout() {
    signout();
  }

  const name = data?.name;
  const email = data?.email;
  const initials = getInitials(name);

  return (
    <Dropdown
      align="center"
      name={isLoading ? "Loading..." : name}
      email={isLoading ? "Loading..." : email}
      onSignout={handleSignout}
      signingOut={isPending}
      trigger={
        <div className="rounded-full">
          <Avatar className="size-10 cursor-pointer">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      }
    />
  );
};

export default ProfileDropdown;

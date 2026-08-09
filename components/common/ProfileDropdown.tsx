import {
  DropdownMenu,
  type DropdownMenuItem,
} from "@/components/godui/dropdown-menu";
import { useSignout } from "@/hooks/queries/useAuth";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

export default function ProfileDropdown() {
  const { mutate: signOut, isPending } = useSignout();
  const router = useRouter();

  const items: DropdownMenuItem[] = [
    { type: "label", label: "vkvioijvkf" },
    { type: "label", label: "dsfsdf" },
    {
      label: "View Profile",
      icon: <User className="size-4" />,
      onSelect: () => router.push("/profile"),
    },
    { type: "separator" },
    {
      label: isPending ? "Logging out..." : "Log out",
      icon: <LogOut className="size-4" />,
      onSelect: () => signOut(),
      disabled: isPending,
    },
  ];

  return (
    <DropdownMenu
      align="end"
      className=" z-[300]"
      trigger={
        <button className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {getInitials("testt")}
        </button>
      }
      items={items}
    />
  );
}

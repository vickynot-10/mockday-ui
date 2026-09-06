import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { NavItem } from "@/components/shadcn-space/blocks/topbar-04/types";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
export function NavDropdown({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}) {
  const pathname = usePathname();
  const isActive = items.some((item) => pathname === item.href);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          "gap-2 rounded-lg border border-transparent relative h-auto py-6",
        
          "data-[state=open]:border-muted data-[state=open]:bg-accent cursor-pointer",
          "[&>svg:last-child]:hidden",
          isActive
            ? "text-foreground after:absolute after:left-4 after:right-4 after:-bottom-0 after:h-[2px] after:bg-foreground"
            : "text-muted-foreground "
        )}
      >
        <Icon size={16} />
        <span className={cn("text-sm ", isActive && "font-semibold")}>
          {label}
        </span>
      </NavigationMenuTrigger>

      <NavigationMenuContent className="min-w-48 p-1">
        <ul className="space-y-1">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <li key={item.label}>
                <NavigationMenuLink
                  render={
                    <Link
                      href={item.href}
                      className="flex items-left gap-2 rounded-md px-2 py-1.5 text-sm "
                    >
                      <div className="flex items-center gap-2">
                        <ItemIcon size={16} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  }
                />
              </li>
            );
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

export function NavButton({
  label,
  icon: Icon,
  href,
}: {
  label: string;
  icon: LucideIcon;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      variant="ghost"
      className={cn(
        "gap-2 rounded-lg relative h-auto py-6",
        
        isActive
          ? "text-foreground after:absolute after:left-4 after:right-4 after:-bottom-0 after:h-[2px] after:bg-foreground"
          : "text-muted-foreground"
      )}
      render={<Link href={href} />}
    >
      <span className="flex items-center gap-2">
        <Icon size={16} />
        <span className={cn("text-sm ", isActive && "font-semibold")}>
          {label}
        </span>
      </span>
    </Button>
  );
}
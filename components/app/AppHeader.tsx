import ThemeToggle from "../common/ThemeToggle";
import ProfileDropdown from "../common/ProfileDropdown";
import { SidebarTrigger } from "../ui/sidebar";
import ConnectExtensionButton from "../common/ConnectExtension";
import NotificationsButton from "../common/Notifications";
export default function AppHeader() {
  return (
    <header className="flex h-[70px] sticky top-0 z-[999] items-center p-3 flex-row justify-between w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <div className=" items-center flex  flex-row gap-3">
        <ConnectExtensionButton />
        <ThemeToggle />
        <NotificationsButton />
        <ProfileDropdown />
      </div>
    </header>
  );
}

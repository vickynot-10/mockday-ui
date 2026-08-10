import ThemeToggle from "../common/ThemeToggle";
import ProfileDropdown from "../common/ProfileDropdown";
import { SidebarTrigger } from "../ui/sidebar";
import ConnectExtensionButton from "../common/ConnectExtension";
export default function AppHeader() {
  return (
    <header className="flex items-center p-3 flex-row justify-between w-full">
      <SidebarTrigger />
      <div className="flex items-center  flex-row gap-3">
        <ConnectExtensionButton />
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
}

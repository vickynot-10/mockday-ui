import ThemeToggle from "../common/ThemeToggle";
import ProfileDropdown from "../common/ProfileDropdown";
import { SidebarTrigger } from "../ui/sidebar";
export default function AppHeader() {
  return (
    <header className="flex items-center flex-row justify-between w-full">
      <SidebarTrigger />
      <div className="flex items-center  flex-row gap-3">
        <ThemeToggle />
        <ProfileDropdown />
      </div>
    </header>
  );
}

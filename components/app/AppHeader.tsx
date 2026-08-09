import ThemeToggle from "../common/ThemeToggle";
import ProfileDropdown from "../common/ProfileDropdown";
import { useState } from "react";
export default function AppHeader() {
  const [search, setSearch] = useState("");
  return (
    <header className="flex items-center flex-row justify-end w-full">
      <ThemeToggle />
      <ProfileDropdown />
    </header>
  );
}

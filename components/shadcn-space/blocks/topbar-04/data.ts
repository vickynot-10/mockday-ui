import {
  FileUser,
  LayersPlus,
  MessageSquare,
  LayoutPanelLeft,
  Settings,
  Settings2,
  RotateCcwIcon,
  Info,
  BriefcaseBusinessIcon,
  WandSparklesIcon,
  Clock10Icon,
} from "lucide-react";

const NavData: any[] = [
  {
    type: "link",
    label: "Dashboard",
    icon: LayersPlus,
    href: "/",
  },
  {
    type: "link",
    label: "Trackers",
    icon: BriefcaseBusinessIcon,
    href: "/job-tracker",
  },
  {
    type: "dropdown",
    label: "Settings",
    icon: Settings,
    items: [
      { label: "Status", icon: Info, href: "/settings/status" },
      {
        label: "Notifications Preferences",
        icon: Settings2,
        href: "/settings/notification-preferences",
      },
      {
        label: "Notifications History",
        icon: RotateCcwIcon,
        href: "/settings/notification-history",
      },
    ],
  },
  {
    type: "dropdown",
    label: "Apps",
    icon: LayoutPanelLeft,
    items: [
      { label: "Resumes", icon: FileUser, href: "/resumes" },
      { label: "AI Assistant", icon: MessageSquare, href: "/ai-assistant" },
      { label: "Autofill Rules", icon: WandSparklesIcon, href: "/autofill" },
      { label: "Reminders", icon: Clock10Icon, href: "/reminders" },
    ],
  },
];

export default NavData;

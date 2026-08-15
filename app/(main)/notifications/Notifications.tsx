"use client";
import {
  useGetNotifications,
  useSaveNotifications,
} from "@/hooks/queries/useNotiications";
import { useEffect, useState } from "react";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mail, Bell } from "lucide-react";

const items = [
  { label: "Settings", isSection: true },
  { label: "Notifications" },
];

export default function Notifications() {
  const { data } = useGetNotifications();
  const { mutate: saveNotifications, isPending } = useSaveNotifications();

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (!data?.data) return;
    setEmailEnabled(data.data.email ?? true);
    setPushEnabled(data.data.push ?? false);
  }, [data]);

  function handleEmailToggle(checked: boolean) {
    setEmailEnabled(checked);
    saveNotifications({ email: checked, push: pushEnabled });
  }

  function handlePushToggle(checked: boolean) {
    setPushEnabled(checked);
    saveNotifications({ email: emailEnabled, push: checked });
  }

  return (
    <>
      <BreadCrumbs items={items} />

      <div className="flex flex-col gap-4 mt-4">
        <div>
          <h2 className="text-lg font-semibold">Reminders</h2>
          <p className="text-sm text-muted-foreground">
            Choose how you want to be notified about tracker reminders
          </p>
        </div>

        <div className="flex items-center justify-between border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </span>
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="email-toggle" className="text-sm font-medium">
                Email
              </Label>
              <p className="text-xs text-muted-foreground">
                Get reminders sent to your email
              </p>
            </div>
          </div>
          <Switch
            id="email-toggle"
            checked={emailEnabled}
            onCheckedChange={handleEmailToggle}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center justify-between border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </span>
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="push-toggle" className="text-sm font-medium">
                Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Get instant reminders as browser push notifications
              </p>
            </div>
          </div>
          <Switch
            id="push-toggle"
            checked={pushEnabled}
            onCheckedChange={handlePushToggle}
            disabled={isPending}
          />
        </div>
      </div>
    </>
  );
}
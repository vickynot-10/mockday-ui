"use client";
import {
  useGetNotifications,
  useSaveNotifications,
  useSendEmailOtp,
  useVerifyEmailOtp,
  useRegisterPush,
} from "@/hooks/queries/useNotiications";
import { useEffect, useState } from "react";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { waitForOneSignal } from "@/lib/onesignal";
import { Switch } from "@/components/ui/switch";
import { useMe } from "@/hooks/useMe";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, Bell, Smartphone } from "lucide-react";
import { AppButton } from "@/components/common/AppButton";
import { toast } from "sonner";

const items = [
  { label: "Settings", isSection: true },
  { label: "Notifications" },
];

export default function Notifications() {
  const { data } = useGetNotifications();
  const { data: userData } = useMe();

  const { mutate: saveNotifications, isPending } = useSaveNotifications();
  const { mutate: sendOtp, isPending: sendingOtp } = useSendEmailOtp();
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyEmailOtp();
  const { mutate: registerPush, isPending: registeringPush } =
    useRegisterPush();

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailMode, setEmailMode] = useState<"account" | "custom">("account");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [pushRegistered, setPushRegistered] = useState(false);

  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<"enter_email" | "enter_otp">(
    "enter_email",
  );
  const [customEmail, setCustomEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");

  useEffect(() => {
    if (!data?.data) return;
    setEmailEnabled(data.data.email ?? true);
    setPushEnabled(data.data.push ?? false);
    setPushRegistered(data.data.push_registered ?? false);
    if (data.data.notify_email && data.data.notify_email !== userData?.email) {
      setEmailMode("custom");
      setVerifiedEmail(data.data.notify_email);
    }
  }, [data, userData]);

  function openOtpDialog() {
    setOtpStep("enter_email");
    setCustomEmail("");
    setOtpValue("");
    setOtpDialogOpen(true);
  }

  function handleSendOtp() {
    sendOtp(
      { email: customEmail },
      {
        onSuccess: () => {
          setOtpStep("enter_otp");
        },
      },
    );
  }

  function handleVerifyOtp() {
    verifyOtp(
      { email: customEmail, otp: otpValue },
      {
        onSuccess: () => {
          setVerifiedEmail(customEmail);
          setEmailMode("custom");
          setOtpDialogOpen(false);
        },
      },
    );
  }

async function handleRegisterDevice() {
 if (!userData?.user_id) return;

  try {
    await waitForOneSignal(process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!);
  } catch (err) {
    console.error("OneSignal init failed:", err);
    toast.error("Notifications aren't ready yet. Try again in a moment.");
    return;
  }

  const OneSignal = window.OneSignal;
  await OneSignal.login(userData.user_id);
  const permission = await OneSignal.Notifications.requestPermission();
  if (!permission) {
    toast.error(
      "Notifications blocked. Enable them in your browser settings to continue.",
    );
    return;
  }

  registerPush(
    { push_registered: true },
    {
      onSuccess: () => {
        setPushRegistered(true);
        toast.success("This device is now registered for push notifications");
      },
      onError: () => {
        toast.error("Failed to register this device. Try again.");
      },
    },
  );
}

  function handleSave() {
    saveNotifications({
      email: emailEnabled,
      push: pushEnabled,
      notify_email:
        emailMode === "custom" ? verifiedEmail : (userData?.email ?? ""),
    });
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

        <div className="flex flex-col gap-3 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
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
              onCheckedChange={setEmailEnabled}
            />
          </div>

          {emailEnabled && (
            <div className="flex items-center gap-2 pl-12">
              <Button
                type="button"
                size="sm"
                variant={emailMode === "account" ? "default" : "outline"}
                onClick={() => setEmailMode("account")}
              >
                Use {userData?.email}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={emailMode === "custom" ? "default" : "outline"}
                onClick={openOtpDialog}
              >
                {emailMode === "custom" && verifiedEmail
                  ? verifiedEmail
                  : "Use a different email"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
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
              onCheckedChange={setPushEnabled}
            />
          </div>

          {pushEnabled && (
            <div className="flex items-center gap-2 pl-12">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRegisterDevice}
                disabled={registeringPush}
              >
                <Smartphone className="size-3.5 mr-1.5" />
                {pushRegistered
                  ? "Registered on this device"
                  : "Register this device"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <AppButton
            type="button"
            onClick={handleSave}
            isLoading={isPending}
            idleLabel="Save Changes"
            loadingLabel="Saving..."
            successLabel="Saved"
          />
        </div>
      </div>

      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify a different email</DialogTitle>
          </DialogHeader>

          {otpStep === "enter_email" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="custom_email"
                  className="text-xs text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="custom_email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOtpDialogOpen(false)}
                >
                  Cancel
                </Button>
                <AppButton
                  type="button"
                  onClick={handleSendOtp}
                  isLoading={sendingOtp}
                  idleLabel="Send OTP"
                  loadingLabel="Sending..."
                  successLabel="Sent"
                  disabled={!customEmail}
                />
              </DialogFooter>
            </div>
          )}

          {otpStep === "enter_otp" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Enter the code sent to {customEmail}
              </p>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="otp_code"
                  className="text-xs text-muted-foreground"
                >
                  OTP
                </Label>
                <Input
                  id="otp_code"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="123456"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOtpStep("enter_email")}
                >
                  Back
                </Button>
                <AppButton
                  type="button"
                  onClick={handleVerifyOtp}
                  isLoading={verifyingOtp}
                  idleLabel="Verify"
                  loadingLabel="Verifying..."
                  successLabel="Verified"
                  disabled={!otpValue}
                />
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

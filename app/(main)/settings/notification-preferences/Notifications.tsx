"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import {
  useGetNotifications,
  useSaveNotifications,
  useRegisterPush,
} from "@/hooks/queries/useNotiications";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { waitForOneSignal } from "@/lib/onesignal";
import { Switch } from "@/components/ui/switch";
import { useMe } from "@/hooks/useMe";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Bell, Smartphone, Check } from "lucide-react";
import { AppButton } from "@/components/common/AppButton";
import { toast } from "sonner";
import SendOtpStep from "./components/SendOTP";
import VerifyOtpStep from "./components/VerifyOTP";

const items = [
  { label: "Settings", isSection: true },
  { label: "Notifications" },
];

const otpSteps = [
  { key: "enter_email", label: "Email" },
  { key: "enter_otp", label: "Verify" },
] as const;

type NotificationFormValues = {
  email: boolean;
  push: boolean;
  notify_email: string;
  push_registered: boolean;
};

export default function Notifications() {
  const { data } = useGetNotifications();
  const { data: userData } = useMe();

  const { mutate: saveNotifications, isPending } = useSaveNotifications();
  const { mutate: registerPush, isPending: registeringPush } =
    useRegisterPush();

  const { control, handleSubmit, setValue, reset } =
    useForm<NotificationFormValues>({
      defaultValues: {
        email: true,
        push: false,
        notify_email: "",
        push_registered: false,
      },
    });

  const emailEnabled = useWatch({ control, name: "email" });
  const pushEnabled = useWatch({ control, name: "push" });
  const notifyEmail = useWatch({ control, name: "notify_email" });
  const pushRegistered = useWatch({ control, name: "push_registered" });

  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<"enter_email" | "enter_otp">(
    "enter_email",
  );
  const [otpEmail, setOtpEmail] = useState("");

  useEffect(() => {
    if (!data?.data) return;
    reset({
      email: data.data.email ?? true,
      push: data.data.push ?? false,
      notify_email: data.data.notify_email || userData?.email || "",
      push_registered: data.data.push_registered ?? false,
    });
  }, [data, userData, reset]);

  const isCustomEmail = !!notifyEmail && notifyEmail !== userData?.email;

  function openOtpDialog() {
    setOtpStep("enter_email");
    setOtpEmail("");
    setOtpDialogOpen(true);
  }

  function handleDialogOpenChange(
    next_open: boolean,
    eventDetails: { reason?: string },
  ) {
    if (eventDetails.reason === "outside-press") return;
    setOtpDialogOpen(next_open);
  }

  function handleOtpSent(email: string) {
    setOtpEmail(email);
    setOtpStep("enter_otp");
  }

  function handleOtpVerified(email: string) {
    setValue("notify_email", email, { shouldDirty: true });
    setOtpDialogOpen(false);
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
          setValue("push_registered", true);
          toast.success("This device is now registered for push notifications");
        },
        onError: () => {
          toast.error("Failed to register this device. Try again.");
        },
      },
    );
  }

  const onSave = handleSubmit((values) => {
    saveNotifications({
      email: values.email,
      push: values.push,
      notify_email: values.notify_email,
    });
  });

  const activeStepIndex = otpSteps.findIndex((s) => s.key === otpStep);

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
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Switch
                  id="email-toggle"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {emailEnabled && (
            <div className="flex items-center gap-2 pl-12">
              <Button
                type="button"
                size="sm"
                variant={!isCustomEmail ? "default" : "outline"}
                onClick={() =>
                  setValue("notify_email", userData?.email ?? "", {
                    shouldDirty: true,
                  })
                }
              >
                Use {userData?.email}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={isCustomEmail ? "default" : "outline"}
                onClick={openOtpDialog}
              >
                {isCustomEmail ? notifyEmail : "Use a different email"}
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
            <Controller
              control={control}
              name="push"
              render={({ field }) => (
                <Switch
                  id="push-toggle"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
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
            onClick={onSave}
            isLoading={isPending}
            idleLabel="Save Changes"
            loadingLabel="Saving..."
            successLabel="Saved"
          />
        </div>
      </div>

      <Dialog open={otpDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex flex-1 items-center gap-2">
                Verify a different email
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 px-1 pb-1">
            {otpSteps.map((step, idx) => {
              const isCompleted = idx < activeStepIndex;
              const isActive = idx === activeStepIndex;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium shrink-0 transition-colors ${
                        isCompleted || isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < otpSteps.length - 1 && (
                    <div
                      className={`h-px flex-1 mx-3 ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {otpStep === "enter_email" && (
            <SendOtpStep
              onCancel={() => setOtpDialogOpen(false)}
              onSent={handleOtpSent}
            />
          )}

          {otpStep === "enter_otp" && (
            <VerifyOtpStep
              email={otpEmail}
              onBack={() => setOtpStep("enter_email")}
              onVerified={handleOtpVerified}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}